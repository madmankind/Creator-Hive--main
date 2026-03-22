"use client";

import { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { KPIPlanner, type KPIData } from "./KPIPlanner";
import { WeeklyKPITracker } from "./WeeklyKPITracker";
import { type CampaignObjective } from "@/lib/campaignObjectives";
import { CAMPAIGN_OBJECTIVES } from "@/lib/campaignObjectives";
import { feyTokens } from "@/lib/fey-design-tokens";
import { trackPulseNewsItems } from "@/lib/hive/pulseSignals";

const STORAGE_KEY = "ch.trackInsightsPanel.pos";

interface PanelPosition {
  x: number;
  y: number;
  isDocked: boolean;
  isExpanded: boolean;
}


interface TrackInsightsPanelProps {
  objective: CampaignObjective;
  plannedData: KPIData | null;
  actualData: KPIData | null;
  onPlannedChange: (data: KPIData) => void;
  onActualChange: (data: KPIData) => void;
  campaignId?: string;
  campaignName?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  creatorsCount?: number;
  deliverablesCount?: number;
  static?: boolean; // If true, render as static component (no floating/absolute positioning)
}

type TabType = "news" | "kpis" | "summary";

/** Same pulse source as Hive Mind — compact operational view. */
const MOCK_NEWS = trackPulseNewsItems();

export function TrackInsightsPanel({
  objective,
  plannedData,
  actualData,
  onPlannedChange,
  onActualChange,
  campaignId,
  campaignName,
  clientName,
  startDate,
  endDate,
  budget,
  spent,
  creatorsCount,
  deliverablesCount,
  static: staticMode = false,
}: TrackInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("kpis");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Tab click handler - toggle behavior
  const handleTabClick = (tab: TabType) => {
    if (isExpanded && activeTab === tab) {
      // Clicking same active tab collapses
      setIsExpanded(false);
      setIsCollapsed(true);
      return;
    }
    // Clicking different tab or collapsed panel expands
    setActiveTab(tab);
    setIsExpanded(true);
    setIsCollapsed(false);
  };
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dragging state
  const [isFloating, setIsFloating] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  // Save position to localStorage
  const savePosition = (pos: { x: number; y: number }, docked: boolean, expanded: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: pos.x, y: pos.y, isDocked: docked, isExpanded: expanded }));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Load saved position from localStorage with migration safeguard
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PanelPosition = JSON.parse(saved);
        // Migration safeguard: if position is near left sidebar (< 300px) or outside bounds, reset to docked
        if (!parsed.isDocked && parsed.x !== undefined && parsed.y !== undefined) {
          // Check if position is too far left (near sidebar) or invalid
          if (parsed.x < 300 || parsed.x < 0 || parsed.y < 0) {
            // Reset to docked
            setIsFloating(false);
            setPosition({ x: 0, y: 0 });
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: 0, y: 0, isDocked: true, isExpanded: parsed.isExpanded || false }));
            } catch (e) {
              // Ignore
            }
            return;
          }
          setPosition({ x: parsed.x, y: parsed.y });
        }
        setIsFloating(!parsed.isDocked);
        setIsExpanded(parsed.isExpanded || false);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  // Handle drag start
  const handleDragStart = (e: React.PointerEvent) => {
    // Don't drag if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (!panelRef.current || !containerRef.current) return;
    
    const panelRect = panelRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate offset from panel's current position
    const currentX = isFloating ? position.x : containerRect.width - panelRect.width - 24;
    const currentY = isFloating ? position.y : 24;
    
    const offsetX = e.clientX - containerRect.left - currentX;
    const offsetY = e.clientY - containerRect.top - currentY;
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX,
      offsetY,
    };
    
    setIsDragging(true);
    setIsFloating(true);
    panelRef.current.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging || !dragStartRef.current || !panelRef.current || !containerRef.current) return;

    const handleMove = (e: PointerEvent) => {
      if (!dragStartRef.current || !panelRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const panelRect = panelRef.current.getBoundingClientRect();
      
      // Calculate new position relative to container
      let newX = e.clientX - containerRect.left - dragStartRef.current.offsetX;
      let newY = e.clientY - containerRect.top - dragStartRef.current.offsetY;
      
      // Clamp to container bounds with padding
      const padding = 16;
      const maxX = containerRect.width - panelRect.width - padding;
      const maxY = containerRect.height - panelRect.height - padding;
      
      newX = Math.max(padding, Math.min(newX, maxX));
      newY = Math.max(padding, Math.min(newY, maxY));
      
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      
      // Update drag start for next move
      dragStartRef.current = {
        ...dragStartRef.current,
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleEnd = (e: PointerEvent) => {
      if (panelRef.current && dragStartRef.current) {
        try {
          panelRef.current.releasePointerCapture(e.pointerId);
        } catch (e) {
          // Ignore if pointer not captured
        }
      }
      
      // Calculate velocity for inertia
      const velocity = dragStartRef.current
        ? {
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
          }
        : { x: 0, y: 0 };
      
      setIsDragging(false);
      dragStartRef.current = null;
      
      // Apply inertia glide
      if (Math.abs(velocity.x) > 2 || Math.abs(velocity.y) > 2) {
        let vx = velocity.x * 0.15;
        let vy = velocity.y * 0.15;
        let friction = 0.92;
        let frameCount = 0;
        const maxFrames = 20;
        let currentPos = { ...position };
        
        const glide = () => {
          if (frameCount >= maxFrames || (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5)) {
            // Snap to nearest corner
            if (containerRef.current && panelRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const panelRect = panelRef.current.getBoundingClientRect();
              const padding = 24;
              
              const corners = [
                { x: padding, y: padding }, // top-left
                { x: containerRect.width - panelRect.width - padding, y: padding }, // top-right
                { x: padding, y: containerRect.height - panelRect.height - padding }, // bottom-left
                { x: containerRect.width - panelRect.width - padding, y: containerRect.height - panelRect.height - padding }, // bottom-right
              ];
              
              let nearest = corners[0];
              let minDist = Math.sqrt(
                Math.pow(currentPos.x - nearest.x, 2) + Math.pow(currentPos.y - nearest.y, 2)
              );
              
              for (const corner of corners.slice(1)) {
                const dist = Math.sqrt(
                  Math.pow(currentPos.x - corner.x, 2) + Math.pow(currentPos.y - corner.y, 2)
                );
                if (dist < minDist) {
                  minDist = dist;
                  nearest = corner;
                }
              }
              
              // Only snap if within threshold
              if (minDist < 100) {
                setPosition(nearest);
                savePosition(nearest, false, isExpanded);
              } else {
                savePosition(currentPos, false, isExpanded);
              }
            }
            return;
          }
          
          if (!containerRef.current || !panelRef.current) return;
          
          const containerRect = containerRef.current.getBoundingClientRect();
          const panelRect = panelRef.current.getBoundingClientRect();
          const padding = 16;
          
          currentPos.x += vx;
          currentPos.y += vy;
          
          const maxX = containerRect.width - panelRect.width - padding;
          const maxY = containerRect.height - panelRect.height - padding;
          
          currentPos.x = Math.max(padding, Math.min(currentPos.x, maxX));
          currentPos.y = Math.max(padding, Math.min(currentPos.y, maxY));
          
          setPosition({ ...currentPos });
          
          vx *= friction;
          vy *= friction;
          frameCount++;
          
          requestAnimationFrame(glide);
        };
        
        requestAnimationFrame(glide);
      } else {
        // No inertia, just save position
        savePosition(position, false, isExpanded);
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
    };
  }, [isDragging, isExpanded]);

  // Handle window resize - reclamp position
  useEffect(() => {
    if (!isFloating || !panelRef.current || !containerRef.current) return;

    const handleResize = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      
      if (!containerRect || !panelRect) return;
      
      const padding = 16;
      const maxX = containerRect.width - panelRect.width - padding;
      const maxY = containerRect.height - panelRect.height - padding;
      
      setPosition((prev) => ({
        x: Math.max(padding, Math.min(prev.x, maxX)),
        y: Math.max(padding, Math.min(prev.y, maxY)),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFloating]);

  // Handle expand/collapse with save
  const handleExpandToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    setIsCollapsed(!newExpanded);
    savePosition(position, !isFloating, newExpanded);
  };

  // Reset position to docked
  const handleResetPosition = () => {
    setIsFloating(false);
    setPosition({ x: 0, y: 0 });
    savePosition({ x: 0, y: 0 }, true, isExpanded);
  };

  // Auto-scroll news vertically
  useEffect(() => {
    if (activeTab === "news" && !isCollapsed) {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % MOCK_NEWS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isCollapsed]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const remaining = budget && spent ? budget - spent : undefined;

  // Static mode: render as normal component without floating/absolute positioning
  if (staticMode) {
    return (
      <div
        className="rounded-[18px] w-full"
        style={{
          background: "radial-gradient(120% 140% at 50% 0%, rgba(120, 40, 40, 0.22) 0%, rgba(20, 20, 20, 0.94) 55%, rgba(10, 10, 10, 0.98) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Header with tabs */}
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            {(["news", "kpis", "summary"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                  color: activeTab === tab ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Panel body */}
        {!isCollapsed && (
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: "600px",
            }}
          >
            {activeTab === "news" && (
              <div className="p-4">
                <div className="relative h-[200px] overflow-hidden">
                  <div
                    className="absolute inset-0 transition-transform duration-1000 ease-linear"
                    style={{
                      transform: `translateY(-${currentNewsIndex * 60}px)`,
                    }}
                  >
                    {MOCK_NEWS.map((item, idx) => (
                      <div
                        key={idx}
                        className="h-[60px] flex flex-col justify-center"
                        style={{
                          opacity: Math.abs(idx - currentNewsIndex) <= 1 ? 1 : 0.3,
                        }}
                      >
                        <div className="text-sm font-medium text-white/90 leading-snug mb-1">
                          {item.headline}
                        </div>
                        <div className="text-[11px] text-white/40">
                          {item.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-[11px] text-white/40">
                    Updated {Math.floor(Math.random() * 5) + 1} min ago
                  </div>
                </div>
              </div>
            )}

            {activeTab === "kpis" && (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                    Planned vs Actual
                  </h3>
                  <KPIPlanner
                    onDataChange={(data) => {
                      if (data.mode === "planned") {
                        onPlannedChange(data);
                      } else {
                        onActualChange(data);
                      }
                    }}
                    objective={objective}
                    dense={objective === "traffic" || objective === "conversions"}
                  />
                </div>
                <div className="border-t border-white/[0.06] pt-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                    Weekly Performance Input
                  </h3>
                  <WeeklyKPITracker campaignId={campaignId} />
                </div>
              </div>
            )}

            {activeTab === "summary" && (
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-1" style={{ fontSize: "14px", fontWeight: 600, color: "#F2F2F2" }}>
                    {campaignName || "No campaign selected"}
                  </div>
                  {clientName && (
                    <div className="text-[12px] text-white/55">{clientName}</div>
                  )}
                </div>

                {(startDate || endDate) && (
                  <div>
                    <div className="text-[11px] text-white/40 mb-1">Date range</div>
                    <div className="text-[12px] text-white/75">
                      {formatDate(startDate)} – {formatDate(endDate)}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[11px] text-white/40 mb-1">Objective</div>
                  <div className="text-[12px] text-white/75 capitalize">{objective}</div>
                </div>

                <div>
                  <div className="text-[11px] text-white/40 mb-1">Status</div>
                  <div className="inline-flex px-2 py-1 rounded text-[11px] font-medium" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                    On plan
                  </div>
                </div>

                {budget !== undefined && (
                  <div>
                    <div className="text-[11px] text-white/40 mb-2">Budget</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/60">Total</span>
                        <span className="text-white/90">${budget.toLocaleString()}</span>
                      </div>
                      {spent !== undefined && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-white/60">Spent</span>
                          <span className="text-white/90">${spent.toLocaleString()}</span>
                        </div>
                      )}
                      {remaining !== undefined && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-white/60">Remaining</span>
                          <span className="text-white/90">${remaining.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(creatorsCount !== undefined || deliverablesCount !== undefined) && (
                  <div>
                    <div className="text-[11px] text-white/40 mb-2">Resources</div>
                    <div className="space-y-1.5">
                      {creatorsCount !== undefined && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-white/60">Creators booked</span>
                          <span className="text-white/90">{creatorsCount}</span>
                        </div>
                      )}
                      {deliverablesCount !== undefined && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-white/60">Deliverables</span>
                          <span className="text-white/90">{deliverablesCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <div
        ref={panelRef}
        className="absolute rounded-[18px] pointer-events-auto"
        style={{
          zIndex: isExpanded ? 40 : 30,
          width: isCollapsed ? "280px" : isExpanded ? "420px" : "360px",
          maxHeight: isCollapsed ? "auto" : isExpanded ? "calc(100% - 48px)" : "520px",
          background: isCollapsed 
            ? "transparent"
            : "radial-gradient(120% 140% at 50% 0%, rgba(120, 40, 40, 0.22) 0%, rgba(20, 20, 20, 0.94) 55%, rgba(10, 10, 10, 0.98) 100%)",
          backdropFilter: isCollapsed ? "none" : "blur(24px)",
          boxShadow: isCollapsed 
            ? "none"
            : "0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: isDragging 
            ? "none" 
            : "opacity 160ms ease-out, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: isExpanded ? 1 : 0.96,
          transformOrigin: "top right",
          transform: isFloating
            ? `translate3d(${position.x}px, ${position.y}px, 0) ${isExpanded ? "scale(1)" : "scale(0.98) translateY(-4px)"}`
            : isExpanded 
              ? "translateY(0) scale(1)"
              : "translateY(-4px) scale(0.98)",
          ...(isFloating
            ? {
                left: 0,
                top: 0,
              }
            : {
                right: "24px",
                top: "20px",
              }),
          cursor: isDragging ? "grabbing" : "default",
          userSelect: isDragging ? "none" : "auto",
          position: "relative",
        }}
      >
        {/* Header with tabs - drag handle */}
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            cursor: "grab",
          }}
          onPointerDown={handleDragStart}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            {(["news", "kpis", "summary"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                onPointerDown={(e) => e.stopPropagation()}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                  color: activeTab === tab ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleExpandToggle}
                className="p-1.5 rounded transition-colors"
                style={{
                  color: "rgba(255,255,255,0.55)",
                }}
                title={isExpanded ? "Collapse" : "Expand"}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setIsCollapsed(true);
                }}
                className="p-1.5 rounded transition-colors"
                style={{
                  color: "rgba(255,255,255,0.40)",
                }}
                title="Close"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Panel body - hidden when collapsed */}
        {!isCollapsed && (
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: isExpanded ? "calc(100vh - 200px)" : "480px",
              pointerEvents: isExpanded ? "auto" : "none",
            }}
          >
        {activeTab === "news" && (
          <div className="p-4">
            <div
              className="relative h-[200px] overflow-hidden"
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            >
              <div
                className="absolute inset-0 transition-transform duration-1000 ease-linear"
                style={{
                  transform: `translateY(-${currentNewsIndex * 60}px)`,
                }}
              >
                {MOCK_NEWS.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-[60px] flex flex-col justify-center"
                    style={{
                      opacity: Math.abs(idx - currentNewsIndex) <= 1 ? 1 : 0.3,
                    }}
                  >
                    <div className="text-sm font-medium text-white/90 leading-snug mb-1">
                      {item.headline}
                    </div>
                    <div className="text-[11px] text-white/40">
                      {item.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="text-[11px] text-white/40">
                Updated {Math.floor(Math.random() * 5) + 1} min ago
              </div>
            </div>
          </div>
        )}

        {activeTab === "kpis" && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                Planned vs Actual
              </h3>
              <KPIPlanner
                onDataChange={(data) => {
                  if (data.mode === "planned") {
                    onPlannedChange(data);
                  } else {
                    onActualChange(data);
                  }
                }}
                objective={objective}
                dense={objective === "traffic" || objective === "conversions"}
              />
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                Weekly Performance Input
              </h3>
              <WeeklyKPITracker campaignId={campaignId} />
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="p-4 space-y-4">
            <div>
              <div className="text-sm font-semibold mb-1" style={{ fontSize: "14px", fontWeight: 600, color: "#F2F2F2" }}>
                {campaignName || "No campaign selected"}
              </div>
              {clientName && (
                <div className="text-[12px] text-white/55">{clientName}</div>
              )}
            </div>

            {(startDate || endDate) && (
              <div>
                <div className="text-[11px] text-white/40 mb-1">Date range</div>
                <div className="text-[12px] text-white/75">
                  {formatDate(startDate)} – {formatDate(endDate)}
                </div>
              </div>
            )}

            <div>
              <div className="text-[11px] text-white/40 mb-1">Objective</div>
              <div className="text-[12px] text-white/75 capitalize">{objective}</div>
            </div>

            <div>
              <div className="text-[11px] text-white/40 mb-1">Status</div>
              <div className="inline-flex px-2 py-1 rounded text-[11px] font-medium" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                On plan
              </div>
            </div>

            {budget !== undefined && (
              <div>
                <div className="text-[11px] text-white/40 mb-2">Budget</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/60">Total</span>
                    <span className="text-white/90">${budget.toLocaleString()}</span>
                  </div>
                  {spent !== undefined && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-white/60">Spent</span>
                      <span className="text-white/90">${spent.toLocaleString()}</span>
                    </div>
                  )}
                  {remaining !== undefined && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-white/60">Remaining</span>
                      <span className="text-white/90">${remaining.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(creatorsCount !== undefined || deliverablesCount !== undefined) && (
              <div>
                <div className="text-[11px] text-white/40 mb-2">Resources</div>
                <div className="space-y-1.5">
                  {creatorsCount !== undefined && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-white/60">Creators booked</span>
                      <span className="text-white/90">{creatorsCount}</span>
                    </div>
                  )}
                  {deliverablesCount !== undefined && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-white/60">Deliverables</span>
                      <span className="text-white/90">{deliverablesCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}

