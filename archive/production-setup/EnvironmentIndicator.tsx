"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function EnvironmentIndicator() {
  const [environment, setEnvironment] = useState<string>('');
  const [databaseUrl, setDatabaseUrl] = useState<string>('');

  useEffect(() => {
    // Get environment from window (client-side)
    const nodeEnv = process.env.NODE_ENV || 'development';
    setEnvironment(nodeEnv);
    
    // Check database URL to determine environment (safe check)
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setDatabaseUrl(isDev ? 'Development Database' : 'Production Database');
  }, []);

  if (environment === 'production') {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        🔴 PRODUCTION
      </Badge>
    );
  }

  return (
    <Badge className="bg-green-100 text-green-800 border-green-200">
      🟢 DEVELOPMENT
    </Badge>
  );
}

export function DatabaseEnvironmentWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning if running on localhost but might be using production DB
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const nodeEnv = process.env.NODE_ENV;
    
    // Show warning if environment mismatch
    if (isDev && nodeEnv === 'production') {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-yellow-600">⚠️</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Environment Warning
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You&apos;re running in development mode but may be connected to a production database. 
              Please verify your environment configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}