import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Github, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-navy flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-primary">
                CrossView
              </span>
            </Link>
            <p className="text-sm text-secondary leading-relaxed">
              See Every Side. Understand Every Story. An AI-powered news intelligence platform that clusters multi-source reporting, verifies claims, and synthesizes consolidated event intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary pt-2">
              <ShieldCheck className="w-4 h-4 text-corroborated" />
              <span>Evidence-Grounded News Intelligence</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li>
                <Link to="/news-feed" className="hover:text-primary transition-colors">
                  AI News Feed
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-primary transition-colors">
                  Perspective Comparison
                </Link>
              </li>
              <li>
                <Link to="/timelines" className="hover:text-primary transition-colors">
                  Event Timelines
                </Link>
              </li>
              <li>
                <Link to="/claims" className="hover:text-primary transition-colors">
                  Claim Analysis
                </Link>
              </li>
              <li>
                <Link to="/ask" className="hover:text-primary transition-colors">
                  Ask CrossView AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Tech */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              Technology
            </h4>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li className="flex items-center gap-2">
                <span>Google Gemini AI</span>
              </li>
              <li className="flex items-center gap-2">
                <span>Sentence Transformers</span>
              </li>
              <li className="flex items-center gap-2">
                <span>Semantic Cosine Clustering</span>
              </li>
              <li className="flex items-center gap-2">
                <span>Multi-Source Ingestion</span>
              </li>
              <li className="flex items-center gap-2">
                <span>Firebase Authentication</span>
              </li>
            </ul>
          </div>

          {/* Ethics & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              Editorial Standards
            </h4>
            <p className="text-xs text-secondary leading-relaxed mb-4">
              CrossView does not fabricate reporting or endorse single viewpoints. Reports are multi-publisher syntheses indicating corroborated, single-source, and disputed reporting.
            </p>
            <div className="pt-2 border-t border-border text-xs text-secondary flex flex-col gap-1">
              <span>© {new Date().getFullYear()} CrossView Intelligence.</span>
              <span>All original news rights reserved to their respective publishers.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
