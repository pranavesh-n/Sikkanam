import React, { useState, useEffect, useCallback } from "react";
import { X, Bug, Lightbulb, Clock, MessageSquare, Send, CheckCircle2, History, AlertCircle, Trash2, Loader2, Database } from "lucide-react";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = "bug" | "feature" | "schedule" | "other";

interface FeedbackItem {
  _id?: string;
  id?: string;
  type: FeedbackType;
  message: string;
  status: "received" | "reviewed" | "resolved";
  appVersion?: string;
  createdAt?: string;
  created_at?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<"submit" | "history">("submit");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("schedule");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [historyList, setHistoryList] = useState<FeedbackItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMongoHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.feedbacks || []);
      }
    } catch (err) {
      console.warn("Failed to load feedback queries from MongoDB:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMongoHistory();
      setSubmittedSuccess(false);
    }
  }, [isOpen, fetchMongoHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          message: message.trim(),
          appVersion: "v2.6.4",
          deviceInfo: `${navigator.platform} | ${navigator.userAgent.slice(0, 80)}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.feedback) {
          setHistoryList((prev) => [data.feedback, ...prev]);
        }
        setSubmittedSuccess(true);
        setMessage("");
        toast.success("Query submitted to Sikkanam database!");

        setTimeout(() => {
          setSubmittedSuccess(false);
          setTab("history");
        }, 1200);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      console.error("Error posting feedback to MongoDB:", err);
      toast.error("Network error submitting query.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuery = async (feedbackId?: string) => {
    if (!feedbackId || deletingId) return;

    setDeletingId(feedbackId);
    try {
      const res = await fetch(`/api/feedback?id=${feedbackId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHistoryList((prev) => prev.filter((item) => (item._id || item.id) !== feedbackId));
        toast.success("Query removed from database");
      } else {
        toast.error("Could not delete query from database");
      }
    } catch (err) {
      console.error("Error deleting feedback query from MongoDB:", err);
      toast.error("Network error deleting query.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden bg-background rounded-2xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Share Feedback & Issues
              </h3>
              <p className="text-xs text-muted-foreground">Help make Sikkanam travel ground-reality accurate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border/60 bg-muted/20 px-4 pt-2">
          <button
            onClick={() => setTab("submit")}
            className={`flex items-center gap-2 pb-2.5 px-3 text-sm font-medium border-b-2 transition-all ${
              tab === "submit"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
          <button
            onClick={() => {
              setTab("history");
              fetchMongoHistory();
            }}
            className={`flex items-center gap-2 pb-2.5 px-3 text-sm font-medium border-b-2 transition-all ${
              tab === "history"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({historyList.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {tab === "submit" ? (
            submittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-foreground">Feedback Received!</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Thank you! Our ground intelligence team reviews route corrections & updates the corridor matrix.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Select Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackType("schedule")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        feedbackType === "schedule"
                          ? "border-primary bg-primary/10 text-primary shadow-sm font-bold"
                          : "border-border bg-card text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Clock className="w-4 h-4 mb-1" />
                      <span>Timing Issue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackType("bug")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        feedbackType === "bug"
                          ? "border-rose-500 bg-rose-500/10 text-rose-600 shadow-sm font-bold"
                          : "border-border bg-card text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Bug className="w-4 h-4 mb-1" />
                      <span>Bug Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackType("feature")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        feedbackType === "feature"
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 shadow-sm font-bold"
                          : "border-border bg-card text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Lightbulb className="w-4 h-4 mb-1" />
                      <span>Feature</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackType("other")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        feedbackType === "other"
                          ? "border-primary bg-primary/10 text-primary shadow-sm font-bold"
                          : "border-border bg-card text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 mb-1" />
                      <span>Other</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Input */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {feedbackType === "schedule"
                      ? "Tell us about inaccurate train/bus timings, missing direct buses, or route issues:"
                      : "Describe what you would like to see or report:"}
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === "schedule"
                        ? "e.g. Coimbatore to Velankanni has direct SETC overnight bus at 9:30 PM, no direct train..."
                        : "Type your feedback here..."
                    }
                    maxLength={2000}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    required
                  />
                  <div className="flex justify-between items-center mt-1 text-[11px] text-muted-foreground">
                    <span>Includes device & app version metadata automatically</span>
                    <span>{message.length}/2000</span>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim() || submitting}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Feedback</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* History Tab */
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {loadingHistory ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="text-xs">Loading feedback history...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto opacity-40" />
                  <p className="text-xs">No feedback submitted yet.</p>
                </div>
              ) : (
                historyList.map((item) => {
                  const itemId = item._id || item.id;
                  const isDeleting = deletingId === itemId;
                  const itemDate = item.createdAt || item.created_at;

                  return (
                    <div
                      key={itemId}
                      className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-2 hover:border-border transition-colors group relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-foreground">
                          {item.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {itemDate
                              ? new Date(itemDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                              : "Recently"}
                          </span>
                          {/* Delete Query Button */}
                          <button
                            onClick={() => handleDeleteQuery(itemId)}
                            disabled={isDeleting}
                            title="Delete this query"
                            className="p-1 rounded-md text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-foreground leading-relaxed text-left">{item.message}</p>

                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Status: Under review by Sikkanam Engine team</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
