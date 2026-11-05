import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Clock, Calendar, ExternalLink, Radio, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

export default function EventTimelinesPage() {
  const location = useLocation();
  const initialEventId = new URLSearchParams(location.search).get('eventId') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEventsList = (preferredId) => {
    return apiService
      .getEvents({ limit: 50 })
      .then((res) => {
        if (res.success && res.events) {
          const uniqueEvents = [];
          const seen = new Set();
          res.events.forEach((e) => {
            const id = String(e._id || e.id);
            if (id && !seen.has(id)) {
              seen.add(id);
              uniqueEvents.push(e);
            }
          });

          setEvents(uniqueEvents);

          const targetId = preferredId || selectedEventId;
          const exists = uniqueEvents.some((e) => String(e._id || e.id) === String(targetId));

          if (exists) {
            setSelectedEventId(targetId);
          } else if (uniqueEvents.length > 0) {
            setSelectedEventId(String(uniqueEvents[0]._id || uniqueEvents[0].id));
          } else {
            setSelectedEventId('');
            setTimeline(null);
          }
        }
      })
      .catch((err) => console.warn('Events load error:', err));
  };

  useEffect(() => {
    loadEventsList(initialEventId);

    const handleSync = () => {
      loadEventsList();
    };

    window.addEventListener('crossview:sync-intelligence', handleSync);
    window.addEventListener('crossview:news-uploaded', handleSync);

    return () => {
      window.removeEventListener('crossview:sync-intelligence', handleSync);
      window.removeEventListener('crossview:news-uploaded', handleSync);
    };
  }, []);

  useEffect(() => {
    const queryEventId = new URLSearchParams(location.search).get('eventId');
    if (queryEventId && queryEventId !== selectedEventId) {
      setSelectedEventId(queryEventId);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedEventId) {
      loadTimeline(selectedEventId);
    } else {
      setLoading(false);
      setTimeline(null);
    }
  }, [selectedEventId]);

  const loadTimeline = async (eventId) => {
    setLoading(true);
    try {
      const res = await apiService.getEventTimeline(eventId);
      if (res.success && res.timeline) {
        setTimeline(res.timeline);
      }
    } catch (err) {
      console.warn('Timeline load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find((e) => String(e._id || e.id) === String(selectedEventId));

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'first_report':
        return 'bg-navy text-white';
      case 'official_statement':
        return 'bg-emerald-800 text-white';
      case 'update':
        return 'bg-amber-700 text-white';
      default:
        return 'bg-gray-200 text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-navy/10 text-navy">
              <Clock className="w-5 h-5 text-navy" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Chronological Intelligence
            </span>
          </div>
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Event Timelines
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1 max-w-2xl leading-relaxed">
            Reconstruct developing scenarios as reporting unfolds. Distinguishes original publication dispatches from actual incident occurrence timestamps.
          </p>
        </div>

        {/* Event Selector */}
        <div className="w-full md:w-72">
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
            Select Developing Story
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={events.length === 0}
            className="w-full p-2 bg-[#F7F7F5] border border-border rounded text-xs font-medium text-primary focus:outline-none focus:border-navy disabled:opacity-60"
          >
            {events.length === 0 ? (
              <option value="">No developing stories available</option>
            ) : (
              events.map((evt) => {
                const id = String(evt._id || evt.id);
                const title = evt.title
                  ? evt.title.length > 55
                    ? evt.title.substring(0, 55) + '...'
                    : evt.title
                  : 'Developing Story';
                const count = evt.sourceCount || evt.articleIds?.length || 1;
                return (
                  <option key={id} value={id}>
                    {title} ({count} {count === 1 ? 'source' : 'sources'})
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-secondary bg-white rounded-lg border border-border">
          <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Ordering chronological milestone records...</span>
        </div>
      ) : !timeline || !timeline.entries || timeline.entries.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border p-8 text-xs text-secondary">
          No chronological entries available for this event yet.
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-border shadow-card">
          {/* Active Event Title Banner */}
          {selectedEvent && (
            <div className="mb-8 pb-4 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-navy">
                {selectedEvent.category} • {selectedEvent.sourceCount} Participating Outlets
              </span>
              <h2 className="font-editorial text-2xl font-bold text-primary mt-1">
                {selectedEvent.title}
              </h2>
            </div>
          )}

          {/* Vertical Interactive Timeline */}
          <div className="relative border-l-2 border-border ml-4 sm:ml-8 space-y-8 pb-4">
            {timeline.entries.map((entry, idx) => {
              const pubDate = new Date(entry.timestamp);
              const eventDate = entry.eventDate ? new Date(entry.eventDate) : pubDate;

              return (
                <div key={entry._id || idx} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-navy group-hover:bg-navy transition-colors" />

                  <div className="bg-[#F7F7F5] p-5 rounded-lg border border-border hover:border-navy/40 transition-all shadow-xs space-y-2">
                    {/* Header: Dates & Milestones */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(entry.category)}`}>
                          {entry.category?.replace('_', ' ') || 'Milestone'}
                        </span>
                        <span className="font-bold text-navy">
                          {entry.sourceName || 'Publisher'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-secondary text-[11px]">
                        <span className="flex items-center gap-1" title="Dispatched by publisher">
                          <Clock className="w-3.5 h-3.5" />
                          Published: {pubDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="font-editorial text-lg font-bold text-primary leading-snug">
                      {entry.title}
                    </h3>

                    {/* Description */}
                    {entry.description && (
                      <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                        {entry.description}
                      </p>
                    )}

                    {/* Footer Source Link */}
                    {entry.articleUrl && (
                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] text-secondary">
                          Occurred approximately: {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <a
                          href={entry.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:underline"
                        >
                          <span>Original Dispatch</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

