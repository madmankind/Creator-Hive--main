"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ChevronRight } from "lucide-react";
import {
  SettingsSectionCard,
  SettingsList,
  SettingsInsetLabel,
  SettingsValueRow,
  SettingsActionRow,
  SettingsIdentityStrip,
  SettingsWorkspaceBadge,
  SettingsAccountFooter,
  SettingsCardIntro,
  SettingsCardFootnote,
  SettingsMetaRow,
  SettingsFieldRow,
  settingsInputClass,
  st,
} from "./settingsPrimitives";
import { AvatarPicker } from "./avatar";
import { uploadAccountAvatar } from "@/lib/avatar/uploadAccountAvatar";

type LegalPayload = {
  accepted: boolean;
  version: string | null;
  acceptedAt: string | null;
  currentVersion: string;
  upToDate: boolean;
};

type Agency = { name: string; website?: string | null; location?: string | null } | null | undefined;
type StripeStatusPayload = { status: "NOT_STARTED" | "PENDING" | "COMPLETE"; accountId: string | null };

function formatLegalSummary(legal: LegalPayload | null): string {
  if (!legal) return "…";
  if (!legal.accepted) return "Not accepted";
  const v = legal.version ?? legal.currentVersion;
  const date =
    legal.acceptedAt != null
      ? new Date(legal.acceptedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : null;
  return date ? `Accepted · v${v} · ${date}` : `Accepted · v${v}`;
}

function stripeShort(s: StripeStatusPayload | null): string {
  if (!s) return "…";
  if (s.status === "NOT_STARTED") return "Not connected";
  if (s.status === "PENDING") return "Action needed";
  return "Connected";
}

function RegionRule({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="h-px w-full" style={{ background: st.hairline }} />;
}

function SaveBar({ busy, disabled, onClick, label = "Save changes" }: { busy: boolean; disabled?: boolean; onClick: () => void; label?: string }) {
  return (
    <div className="flex items-center justify-end gap-3 border-b border-white/[0.055] px-5 py-3 lg:px-6">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={onClick}
        className="rounded-lg bg-white/[0.08] px-4 py-2 text-[12px] font-semibold text-white/90 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Saving…" : label}
      </button>
    </div>
  );
}

type AccountImageDraft =
  | { kind: "none" }
  | { kind: "remove" }
  | { kind: "file"; file: File; previewUrl: string }
  | { kind: "import"; url: string };

export function AccountPanel({
  name,
  email,
  image,
  workspaceBadge,
  onSignOut,
}: {
  name: string;
  email: string;
  image: string | null | undefined;
  workspaceBadge: ReactNode;
  onSignOut: () => void;
}) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(name);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState({ name: name, image: image ?? "" });
  const [imageDraft, setImageDraft] = useState<AccountImageDraft>({ kind: "none" });
  const blobPreviewRef = useRef<string | null>(null);

  const revokeBlobPreview = useCallback(() => {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      revokeBlobPreview();
    };
  }, [revokeBlobPreview]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await fetch("/api/settings/account", { credentials: "include" });
        if (!r.ok) return;
        const j = (await r.json()) as { user: { name: string | null; email: string; image: string | null } };
        if (c) return;
        const n = j.user.name ?? name;
        const img = j.user.image ?? "";
        setDisplayName(n);
        setBaseline({ name: n, image: img });
        setImageDraft({ kind: "none" });
        revokeBlobPreview();
      } catch {
        /* ignore */
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [name, email, image, revokeBlobPreview]);

  const resolvedPreview = useMemo(() => {
    if (imageDraft.kind === "remove") return null;
    if (imageDraft.kind === "file") return imageDraft.previewUrl;
    if (imageDraft.kind === "import") return imageDraft.url;
    return baseline.image || null;
  }, [imageDraft, baseline.image]);

  const nameDirty = displayName.trim() !== baseline.name;
  const imageDirty = useMemo(() => {
    const b = baseline.image ?? "";
    if (imageDraft.kind === "none") return false;
    if (imageDraft.kind === "remove") return b !== "";
    if (imageDraft.kind === "file") return true;
    return imageDraft.url !== b;
  }, [imageDraft, baseline.image]);

  const dirty = nameDirty || imageDirty;

  const onAvatarFile = useCallback(
    (file: File) => {
      revokeBlobPreview();
      const url = URL.createObjectURL(file);
      blobPreviewRef.current = url;
      setImageDraft({ kind: "file", file, previewUrl: url });
    },
    [revokeBlobPreview],
  );

  const onAvatarImport = useCallback(
    (url: string) => {
      revokeBlobPreview();
      setImageDraft({ kind: "import", url });
    },
    [revokeBlobPreview],
  );

  const onAvatarRemove = useCallback(() => {
    revokeBlobPreview();
    setImageDraft({ kind: "remove" });
  }, [revokeBlobPreview]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      let imageOut = baseline.image ?? "";
      if (imageDraft.kind === "remove") {
        imageOut = "";
      } else if (imageDraft.kind === "import") {
        imageOut = imageDraft.url;
      } else if (imageDraft.kind === "file") {
        try {
          const { url } = await uploadAccountAvatar(imageDraft.file);
          imageOut = url;
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not upload photo.");
          return;
        }
      }

      const r = await fetch("/api/settings/account", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName.trim() || baseline.name,
          image: imageOut,
        }),
      });
      const j = (await r.json()) as { user?: { name: string | null; image: string | null }; error?: unknown };
      if (!r.ok) {
        setError("Could not save account.");
        return;
      }
      if (j.user) {
        revokeBlobPreview();
        setImageDraft({ kind: "none" });
        setBaseline({ name: j.user.name ?? displayName, image: j.user.image ?? "" });
        setDisplayName(j.user.name ?? "");
      }
      router.refresh();
    } catch {
      setError("Could not save account.");
    } finally {
      setSaving(false);
    }
  }, [baseline.image, baseline.name, displayName, imageDraft, revokeBlobPreview, router]);

  const stripName = loading ? name : displayName || name;
  const stripEmail = email;
  const stripImage = loading ? image : resolvedPreview ?? undefined;

  return (
    <SettingsSectionCard>
      <SettingsIdentityStrip
        name={stripName}
        email={stripEmail}
        imageUrl={stripImage}
        badge={<SettingsWorkspaceBadge>{workspaceBadge}</SettingsWorkspaceBadge>}
      />
      <SettingsCardIntro>Editable fields are stored in Creator Hive. Sign-in identity below is read-only.</SettingsCardIntro>

      <SettingsList>
        <SettingsFieldRow label="Display name" hint="Shown across Hive and on your profile where applicable.">
          <input className={settingsInputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Profile photo"
          hint="Upload a photo or import from a connected account. Your image is stored with your account when you save."
        >
          <AvatarPicker
            name={stripName}
            email={stripEmail}
            previewSrc={resolvedPreview}
            isRemoved={imageDraft.kind === "remove"}
            onFileSelected={onAvatarFile}
            onImportUrl={onAvatarImport}
            onRemove={onAvatarRemove}
          />
        </SettingsFieldRow>
      </SettingsList>

      <SaveBar busy={saving} disabled={!dirty} onClick={() => void save()} />

      {error ? (
        <p className="border-b border-white/[0.055] px-5 py-2 text-[12px] text-amber-200/90 lg:px-6">{error}</p>
      ) : null}

      <SettingsList>
        <SettingsMetaRow label="Auth email" value={email} hint="This is your sign-in identifier. It is not editable here." />
        <SettingsMetaRow label="Sign-in method" value="Email" hint="Magic link or one-time code via your inbox." />
        <SettingsMetaRow label="Session" value="Active in this browser" hint="Ends when you sign out or the session expires." />
        <SettingsMetaRow
          label="Security"
          value="Password and MFA live with your email provider."
          hint="Creator Hive does not store a separate password for email sign-in."
        />
      </SettingsList>

      <SettingsAccountFooter onSignOut={onSignOut} />
    </SettingsSectionCard>
  );
}

function commaJoin(arr: string[] | undefined | null) {
  return (arr && arr.length ? arr : []).join(", ");
}

function commaSplit(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function WorkspacePanel({
  showBrand,
  showTalent,
  isAdmin,
  agency,
}: {
  showBrand: boolean;
  showTalent: boolean;
  isAdmin: boolean;
  agency: Agency;
}) {
  const router = useRouter();
  const both = showBrand && showTalent;
  const labelBrand = both && isAdmin;
  const labelTalent = both && isAdmin;

  const [aname, setAname] = useState("");
  const [awebsite, setAwebsite] = useState("");
  const [alocation, setAlocation] = useState("");
  const [abase, setAbase] = useState({ name: "", website: "", location: "" });
  const [agencyBusy, setAgencyBusy] = useState(false);
  const [agencyErr, setAgencyErr] = useState<string | null>(null);

  useEffect(() => {
    if (agency === undefined) return;
    const n = agency?.name ?? "";
    const w = agency?.website ?? "";
    const l = agency?.location ?? "";
    setAname(n);
    setAwebsite(w);
    setAlocation(l);
    setAbase({ name: n, website: w, location: l });
  }, [agency]);

  const agencyDirty =
    showBrand &&
    (aname !== abase.name || awebsite !== abase.website || alocation !== abase.location);

  const saveAgency = useCallback(async () => {
    setAgencyBusy(true);
    setAgencyErr(null);
    try {
      const r = await fetch("/api/agency/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: aname.trim() || "Workspace",
          website: awebsite.trim(),
          location: alocation.trim(),
        }),
      });
      if (!r.ok) {
        setAgencyErr("Could not save workspace.");
        return;
      }
      const j = (await r.json()) as { agency: { name: string; website?: string | null; location?: string | null } };
      setAbase({
        name: j.agency.name,
        website: j.agency.website ?? "",
        location: j.agency.location ?? "",
      });
      router.refresh();
    } catch {
      setAgencyErr("Could not save workspace.");
    } finally {
      setAgencyBusy(false);
    }
  }, [alocation, aname, awebsite, router]);

  const brandConfigured = Boolean(agency?.name);

  const [cLoading, setCLoading] = useState(true);
  const [cErr, setCErr] = useState<string | null>(null);
  const [cBusy, setCBusy] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [niches, setNiches] = useState("");
  const [roles, setRoles] = useState("");
  const [prefNiches, setPrefNiches] = useState("");
  const [minRate, setMinRate] = useState("");
  const [availability, setAvailability] = useState("AVAILABLE");
  const [isActive, setIsActive] = useState(true);
  const [cBase, setCBase] = useState<string>("");

  useEffect(() => {
    if (!showTalent) {
      setCLoading(false);
      return;
    }
    let c = false;
    (async () => {
      try {
        const r = await fetch("/api/creator/settings", { credentials: "include" });
        if (!r.ok) {
          if (!c) setHasProfile(false);
          return;
        }
        const j = (await r.json()) as {
          profile: null | {
            displayName: string | null;
            name: string;
            location: string | null;
            bio: string | null;
            skills: string[];
            niches: string[];
            availabilityStatus: string;
            isActive: boolean;
          };
          preference: null | { minRate: number | null; interestedRoles: string[]; interestedNiches: string[] };
        };
        if (c) return;
        if (!j.profile) {
          setHasProfile(false);
          return;
        }
        setHasProfile(true);
        const p = j.profile;
        const pr = j.preference;
        setDisplayName(p.displayName ?? "");
        setCreatorName(p.name);
        setLocation(p.location ?? "");
        setBio(p.bio ?? "");
        setSkills(commaJoin(p.skills));
        setNiches(commaJoin(p.niches));
        setRoles(commaJoin(pr?.interestedRoles));
        setPrefNiches(commaJoin(pr?.interestedNiches));
        setMinRate(pr?.minRate != null ? String(pr.minRate) : "");
        setAvailability(p.availabilityStatus || "AVAILABLE");
        setIsActive(p.isActive);
        setCBase(
          JSON.stringify({
            displayName: p.displayName ?? "",
            name: p.name,
            location: p.location ?? "",
            bio: p.bio ?? "",
            skills: commaJoin(p.skills),
            niches: commaJoin(p.niches),
            roles: commaJoin(pr?.interestedRoles),
            pn: commaJoin(pr?.interestedNiches),
            minRate: pr?.minRate != null ? String(pr.minRate) : "",
            availability: p.availabilityStatus || "AVAILABLE",
            isActive: p.isActive,
          }),
        );
      } catch {
        if (!c) setCErr("Could not load creator settings.");
      } finally {
        if (!c) setCLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [showTalent]);

  const creatorSnapshot = useMemo(
    () =>
      JSON.stringify({
        displayName,
        name: creatorName,
        location,
        bio,
        skills,
        niches,
        roles,
        pn: prefNiches,
        minRate,
        availability,
        isActive,
      }),
    [bio, creatorName, displayName, isActive, location, minRate, niches, prefNiches, roles, skills, availability],
  );

  const creatorDirty = showTalent && hasProfile && cBase !== "" && creatorSnapshot !== cBase;

  const saveCreator = useCallback(async () => {
    setCBusy(true);
    setCErr(null);
    try {
      const min = minRate.trim() === "" ? null : parseInt(minRate, 10);
      const r = await fetch("/api/creator/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() === "" ? null : displayName.trim(),
          name: creatorName.trim() || "Creator",
          location: location.trim() === "" ? null : location.trim(),
          bio: bio.trim() === "" ? null : bio.trim(),
          skills: commaSplit(skills),
          niches: commaSplit(niches),
          interestedRoles: commaSplit(roles),
          interestedNiches: commaSplit(prefNiches),
          minRate: min != null && Number.isFinite(min) ? min : null,
          availabilityStatus: availability as "AVAILABLE" | "BUSY" | "UNAVAILABLE",
          isActive,
        }),
      });
      if (!r.ok) {
        setCErr("Could not save creator workspace.");
        return;
      }
      setCBase(creatorSnapshot);
      router.refresh();
    } catch {
      setCErr("Could not save creator workspace.");
    } finally {
      setCBusy(false);
    }
  }, [
    availability,
    bio,
    creatorName,
    creatorSnapshot,
    displayName,
    isActive,
    location,
    minRate,
    niches,
    prefNiches,
    roles,
    router,
    skills,
  ]);

  return (
    <SettingsSectionCard>
      <SettingsCardIntro>Workspace settings persist to your agency or creator record — not quick links into the product shell.</SettingsCardIntro>

      {showBrand ? (
        <>
          {labelBrand ? <SettingsInsetLabel>Brand</SettingsInsetLabel> : null}
          <SettingsList>
            <SettingsFieldRow label="Workspace / agency name" hint="Stored on your agency account.">
              <input className={settingsInputClass} value={aname} onChange={(e) => setAname(e.target.value)} />
            </SettingsFieldRow>
            <SettingsFieldRow label="Website" hint="Public site for the brand or agency.">
              <input className={settingsInputClass} value={awebsite} onChange={(e) => setAwebsite(e.target.value)} placeholder="https://…" />
            </SettingsFieldRow>
            <SettingsFieldRow label="Location" hint="City / region as you want it displayed.">
              <input className={settingsInputClass} value={alocation} onChange={(e) => setAlocation(e.target.value)} />
            </SettingsFieldRow>
            <SettingsMetaRow
              label="Onboarding"
              value={brandConfigured ? "Brand record saved" : "Incomplete"}
              hint={brandConfigured ? undefined : "Finish required brand details."}
            />
            {!brandConfigured ? <SettingsActionRow href="/get-started/agency" label="Continue brand setup" hint="Required onboarding" /> : null}
          </SettingsList>
          <SaveBar busy={agencyBusy} disabled={!agencyDirty} onClick={() => void saveAgency()} label="Save brand workspace" />
          {agencyErr ? (
            <p className="border-b border-white/[0.055] px-5 py-2 text-[12px] text-amber-200/90 lg:px-6">{agencyErr}</p>
          ) : null}
        </>
      ) : null}

      <RegionRule show={Boolean(showBrand && showTalent)} />

      {showTalent ? (
        <>
          {labelTalent ? <SettingsInsetLabel>Talent</SettingsInsetLabel> : null}
          {!hasProfile && !cLoading ? (
            <div className="px-5 py-4 text-[13px] text-white/70 lg:px-6">
              No creator profile yet.{" "}
              <a className="text-teal-300/90 underline-offset-2 hover:underline" href="/onboarding/step-1">
                Complete onboarding
              </a>{" "}
              to edit these fields.
            </div>
          ) : null}
          {hasProfile ? (
            <>
              <SettingsList>
                <SettingsMetaRow label="Workspace type" value={isAdmin ? "Admin" : "Creator"} hint="Role metadata." />
                <SettingsFieldRow label="Display name" hint="Public-facing creator name.">
                  <input className={settingsInputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={cLoading} />
                </SettingsFieldRow>
                <SettingsFieldRow label="Name" hint="Internal roster name.">
                  <input className={settingsInputClass} value={creatorName} onChange={(e) => setCreatorName(e.target.value)} disabled={cLoading} />
                </SettingsFieldRow>
                <SettingsFieldRow label="Location">
                  <input className={settingsInputClass} value={location} onChange={(e) => setLocation(e.target.value)} disabled={cLoading} />
                </SettingsFieldRow>
                <SettingsFieldRow label="Bio" hint="Short description (stored on your creator profile).">
                  <textarea
                    className={settingsInputClass + " min-h-[88px] resize-y"}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={cLoading}
                  />
                </SettingsFieldRow>
                <SettingsFieldRow label="Availability" hint="Your availability signal for opportunities.">
                  <select
                    className={settingsInputClass}
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    disabled={cLoading}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </SettingsFieldRow>
                <SettingsFieldRow label="Rate floor" hint="Minimum rate for opportunities (integer; your currency context applies in product).">
                  <input
                    className={settingsInputClass}
                    inputMode="numeric"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value.replace(/[^0-9]/g, ""))}
                    disabled={cLoading}
                  />
                </SettingsFieldRow>
                <SettingsFieldRow label="Skills" hint="Comma-separated tags.">
                  <input className={settingsInputClass} value={skills} onChange={(e) => setSkills(e.target.value)} disabled={cLoading} />
                </SettingsFieldRow>
                <SettingsFieldRow label="Specialization / niches" hint="Comma-separated.">
                  <input className={settingsInputClass} value={niches} onChange={(e) => setNiches(e.target.value)} disabled={cLoading} />
                </SettingsFieldRow>
                <SettingsFieldRow label="Interested roles" hint="Comma-separated roles you want (preferences).">
                  <input className={settingsInputClass} value={roles} onChange={(e) => setRoles(e.target.value)} disabled={cLoading} />
                </SettingsFieldRow>
                <SettingsFieldRow label="Interested niches" hint="Comma-separated (preferences).">
                  <input className={settingsInputClass} value={prefNiches} onChange={(e) => setPrefNiches(e.target.value)} disabled={cLoading} />
                </SettingsFieldRow>
                <SettingsFieldRow
                  label="Public profile visibility"
                  hint="When off, your creator profile is hidden from discovery surfaces that respect this flag."
                >
                  <label className="flex items-center gap-2 text-[13px] text-white/75">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={cLoading} />
                    Profile active
                  </label>
                </SettingsFieldRow>
              </SettingsList>
              <SaveBar busy={cBusy} disabled={!creatorDirty || cLoading} onClick={() => void saveCreator()} label="Save creator workspace" />
              {cErr ? (
                <p className="border-b border-white/[0.055] px-5 py-2 text-[12px] text-amber-200/90 lg:px-6">{cErr}</p>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}

      <SettingsCardFootnote>
        Notification channel preferences are not stored yet — email defaults apply. When supported, they will appear here as real controls.
      </SettingsCardFootnote>
    </SettingsSectionCard>
  );
}

export function BillingPanel({
  stripe,
  payoutBusy,
  onPayout,
}: {
  stripe: StripeStatusPayload | null;
  payoutBusy: boolean;
  onPayout: () => void;
}) {
  return (
    <SettingsSectionCard>
      <SettingsCardIntro>
        Payout destination is configured through Stripe Connect. This is a real billing control — not a link to your wallet dashboard.
      </SettingsCardIntro>
      <SettingsList>
        <SettingsMetaRow label="Payout connection" value={stripeShort(stripe)} hint="Read-only status from Stripe." />
        <SettingsActionRow
          label={stripe?.status === "COMPLETE" ? "Update payout account in Stripe" : "Connect payout account (Stripe)"}
          hint={payoutBusy ? "Opening…" : "Opens Stripe’s hosted onboarding or account management."}
          onClick={onPayout}
          disabled={payoutBusy}
          trailing={<ChevronRight className="h-4 w-4 opacity-25" aria-hidden />}
        />
      </SettingsList>
    </SettingsSectionCard>
  );
}

export function SupportPanel({ legal }: { legal: LegalPayload | null }) {
  const showLegalAction = legal != null && (!legal.accepted || !legal.upToDate);

  return (
    <SettingsSectionCard>
      <SettingsCardIntro>Policies and contact — actions only when something needs your attention.</SettingsCardIntro>
      <SettingsList>
        <SettingsMetaRow label="Legal acceptance" value={formatLegalSummary(legal)} hint="Read-only status from your account record." />
        {showLegalAction ? <SettingsActionRow href="/legal/accept" label="Review and accept" hint="Required before you can continue." /> : null}
        <SettingsActionRow href="/privacy" label="Privacy policy" />
        <SettingsActionRow href="/terms" label="Terms of service" />
      </SettingsList>
      <div className="border-t border-white/[0.055]">
        <SettingsInsetLabel>Contact</SettingsInsetLabel>
        <SettingsList>
          <SettingsActionRow href="mailto:support@creatorhive.ae?subject=Creator%20Hive%20help" label="Email support" external />
          <SettingsActionRow href="mailto:support@creatorhive.ae?subject=Creator%20Hive%20issue" label="Report an issue" external />
        </SettingsList>
      </div>
    </SettingsSectionCard>
  );
}
