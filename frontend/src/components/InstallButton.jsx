import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = window.navigator.standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
        setIsInstalled(true);
        setShowInstall(false);
      }
    };

    checkInstalled();

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstall(false);
      toast.success('Loyalvest installed successfully!');
    });

    // Check on page load and visibility change
    window.addEventListener('pageshow', checkInstalled);
    document.addEventListener('visibilitychange', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pageshow', checkInstalled);
      document.removeEventListener('visibilitychange', checkInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Installation not available. Try using Chrome browser.');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('App installed successfully!');
        setShowInstall(false);
      } else {
        toast.error('Installation cancelled');
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      toast.error('Failed to install app');
    }
  };

  // Don't show if already installed
  if (isInstalled) return null;

  return (
    <>
      {showInstall && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:bottom-20 md:w-80">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FiDownload className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Install Loyalvest App</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Get faster access, offline mode, and better experience
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
                  >
                    Install Now
                  </button>
                  <button
                    onClick={() => setShowInstall(false)}
                    className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/30 transition"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowInstall(false)}
                className="p-1 hover:bg-white/20 rounded transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallButton;