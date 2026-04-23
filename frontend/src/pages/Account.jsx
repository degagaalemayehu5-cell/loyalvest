import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { FiCopy, FiUsers, FiRefreshCw, FiLock, FiUnlock } from "react-icons/fi";
import toast from "react-hot-toast";
import PendingOrderList from "../components/PendingOrderList";

const Account = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [referralDetails, setReferralDetails] = useState([]);
  const [stats, setStats] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching account data...");

      // Fetch referrals list
      const referralsRes = await api.get("/users/referrals");
      console.log("Referrals response:", referralsRes.data);
      setReferrals(referralsRes.data.referrals || []);

      // Fetch user stats (includes totalReferralBonus)
      const statsRes = await api.get("/users/stats");
      console.log("Stats response:", statsRes.data);
      console.log(
        "totalReferralBonus from API:",
        statsRes.data.stats?.totalReferralBonus,
      );
      setStats(statsRes.data.stats);

      // Fetch referral details with status (locked/available)
      const referralDetailRes = await api.get("/users/referrals-detail");
      console.log("Referral details response:", referralDetailRes.data);
      setReferralDetails(referralDetailRes.data.referrals || []);
      setReferralStats(referralDetailRes.data.stats);
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || "");
    toast.success("Referral code copied!");
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  // Get referral bonus from stats API
  const referralBonus = stats?.totalReferralBonus || 0;

  console.log("Referral bonus being displayed:", referralBonus);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pt-8 pb-12 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-blue-100 mt-1">
              Manage your investments and referrals
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
          >
            <FiRefreshCw
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Referral Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Referral Program
          </h2>

          {/* Referral Code Box */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded-lg font-mono text-lg text-center">
                {user?.referralCode}
              </code>
              <button
                onClick={copyReferralCode}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
              >
                <FiCopy />
              </button>
            </div>
            <button
              onClick={copyReferralLink}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition mt-3"
            >
              Share Referral Link
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">
                {referrals.length}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-500">Referral Bonus Earned</p>
              <p className="text-2xl font-bold text-green-600">
                ETB{referralBonus}
              </p>
            </div>
          </div>

          {/* Referral Bonus Breakdown */}
          {referralStats && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-500">Locked</p>
                <p className="text-lg font-bold text-yellow-600">
                  {referralStats.locked}
                </p>
                <p className="text-xs text-gray-400">
                  ETB{referralStats.totalBonusLocked}
                </p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-500">Available</p>
                <p className="text-lg font-bold text-green-600">
                  {referralStats.available}
                </p>
                <p className="text-xs text-gray-400">
                  ETB{referralStats.totalBonusAvailable}
                </p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-bold text-blue-600">
                  {referralStats.paid}
                </p>
                <p className="text-xs text-gray-400">
                  ETB{referralStats.totalBonusPaid}
                </p>
              </div>
            </div>
          )}

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Total Wallet Balance</p>
            <p className="text-2xl font-bold text-blue-600">
              ETB{(stats?.balance || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Referrals List with Status */}
        {referralDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiUsers className="text-green-600" /> Your Referrals (
              {referralDetails.length})
            </h3>
            <div className="space-y-3">
              {referralDetails.map((ref) => (
                <div key={ref._id} className="border-b last:border-0 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {ref.referred?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Deposited: ETB{ref.referredUserDeposit} / ETB
                        {ref.minDepositRequired}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                          ref.status === "available"
                            ? "bg-green-100 text-green-700"
                            : ref.status === "locked"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ref.status === "available" && (
                          <FiUnlock className="w-3 h-3" />
                        )}
                        {ref.status === "locked" && (
                          <FiLock className="w-3 h-3" />
                        )}
                        {ref.status === "available"
                          ? "Available"
                          : ref.status === "locked"
                            ? "Locked"
                            : "Paid"}
                      </span>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        +ETB{ref.bonusAmount}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar for locked referrals */}
                  {ref.status === "locked" && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress to unlock</span>
                        <span>
                          {Math.min(
                            100,
                            (ref.referredUserDeposit / ref.minDepositRequired) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-yellow-500 rounded-full h-1.5 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (ref.referredUserDeposit / ref.minDepositRequired) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Need ETB
                        {Math.max(
                          0,
                          ref.minDepositRequired - ref.referredUserDeposit,
                        )}{" "}
                        more deposit to unlock
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                💡{" "}
                <span className="font-semibold">How referral bonus works:</span>
                <br />
                • You earn ETB50 for each friend who joins using your code
                <br />• Bonus is{" "}
                <strong className="text-yellow-600">LOCKED</strong> until your
                friend deposits ETB500 total
                <br />
                • Once unlocked, bonus is added to your wallet automatically
                <br />• You can withdraw unlocked bonus anytime
              </p>
            </div>
          </div>
        )}

        {/* No Referrals Message */}
        {referralDetails.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No referrals yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Share your referral code to earn ETB50 per referral!
            </p>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-left">
              <p className="text-xs text-blue-800">
                💡 <span className="font-semibold">How it works:</span>
                <br />
                1. Share your referral code
                <br />
                2. Friend registers using your code
                <br />
                3. Friend deposits ETB500 total
                <br />
                4. You get ETB50 added to your wallet!
              </p>
            </div>
          </div>
        )}

        {/* Pending Orders */}
        <PendingOrderList />
      </div>
    </div>
  );
};

export default Account;
