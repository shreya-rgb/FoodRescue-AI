import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdEmojiEvents, MdPerson } from 'react-icons/md';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Loader from '../components/common/Loader';

const TIMEFRAMES = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'alltime', label: 'All Time' },
];

const RANK_COLORS = ['#F59E0B', '#94A3B8', '#D97706'];
const RANK_ICONS = ['🥇', '🥈', '🥉'];

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span style={{ fontSize: '1.5rem' }}>{RANK_ICONS[rank - 1]}</span>
    );
  }
  return (
    <span style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--bg-dark)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)',
      flexShrink: 0,
    }}>
      {rank}
    </span>
  );
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('alltime');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/leaderboard?timeframe=${timeframe}&limit=50`);
      setLeaderboard(data.leaderboard || []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const myRank = leaderboard.find((u) => u.id === (user?._id || user?.id));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MdEmojiEvents size={32} color="var(--secondary)" /> Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Top food rescuers in the community
        </p>
      </div>

      {/* Timeframe tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
        {TIMEFRAMES.map((t) => (
          <button
            key={t.value}
            className={`tab ${timeframe === t.value ? 'active' : ''}`}
            onClick={() => setTimeframe(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* My rank card */}
      {myRank && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '1.5rem',
            border: '1px solid rgba(16,185,129,0.4)',
            background: 'rgba(16,185,129,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Your Rank</span>
            <RankBadge rank={myRank.rank} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700 }}>{myRank.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                {myRank.points.toLocaleString()} pts · {myRank.totalMealsRescued} meals rescued
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 podium */}
      {!loading && leaderboard.length >= 3 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', justifyContent: 'center' }}>
          {/* 2nd place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ flex: 1, maxWidth: 200, textAlign: 'center' }}
          >
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '1.25rem 1rem',
              borderTop: '3px solid #94A3B8',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 700, margin: '0 auto 0.5rem', overflow: 'hidden',
              }}>
                {leaderboard[1].avatar
                  ? <img src={leaderboard[1].avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : leaderboard[1].name?.[0]?.toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{leaderboard[1].name}</p>
              <p style={{ color: 'var(--secondary)', fontWeight: 700 }}>{leaderboard[1].points.toLocaleString()}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>pts</p>
            </div>
          </motion.div>

          {/* 1st place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ flex: 1, maxWidth: 220, textAlign: 'center' }}
          >
            <div style={{
              background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.4)',
              borderRadius: 'var(--radius-md)', padding: '1.5rem 1rem',
              borderTop: '3px solid #F59E0B',
              boxShadow: '0 0 24px rgba(245,158,11,0.15)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥇</div>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#F59E0B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 0.5rem', overflow: 'hidden',
                boxShadow: '0 0 16px rgba(245,158,11,0.4)',
              }}>
                {leaderboard[0].avatar
                  ? <img src={leaderboard[0].avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : leaderboard[0].name?.[0]?.toUpperCase()}
              </div>
              <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>{leaderboard[0].name}</p>
              <p style={{ color: '#F59E0B', fontWeight: 800, fontSize: '1.25rem' }}>{leaderboard[0].points.toLocaleString()}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>pts</p>
            </div>
          </motion.div>

          {/* 3rd place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ flex: 1, maxWidth: 200, textAlign: 'center' }}
          >
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '1.25rem 1rem',
              borderTop: '3px solid #D97706',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥉</div>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: '#D97706',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 700, margin: '0 auto 0.5rem', overflow: 'hidden',
              }}>
                {leaderboard[2].avatar
                  ? <img src={leaderboard[2].avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : leaderboard[2].name?.[0]?.toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{leaderboard[2].name}</p>
              <p style={{ color: '#D97706', fontWeight: 700 }}>{leaderboard[2].points.toLocaleString()}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>pts</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <Loader text="Loading leaderboard..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px 80px', gap: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Rank</span>
            <span>User</span>
            <span style={{ textAlign: 'right' }}>Points</span>
            <span style={{ textAlign: 'right' }}>Meals</span>
            <span style={{ textAlign: 'right' }}>Badges</span>
          </div>
          {leaderboard.map((entry, i) => {
            const isMe = entry.id === (user?._id || user?.id);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  padding: '0.875rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 100px 100px 80px',
                  gap: '1rem',
                  alignItems: 'center',
                  background: isMe ? 'rgba(16,185,129,0.05)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <RankBadge rank={entry.rank} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: isMe ? 'var(--primary)' : 'var(--bg-card-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', flexShrink: 0,
                  }}>
                    {entry.avatar
                      ? <img src={entry.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : entry.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.name} {isMe && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(you)</span>}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {(entry.totalFoodSaved || 0).toFixed(1)} kg saved
                    </p>
                  </div>
                </div>

                <p style={{ textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                  {entry.points.toLocaleString()}
                </p>

                <p style={{ textAlign: 'right', color: 'var(--primary)', fontWeight: 600 }}>
                  {entry.totalMealsRescued || 0}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.125rem' }}>
                  {(entry.badges || []).slice(0, 3).map((badge, bi) => (
                    <span key={bi} title={badge.name} style={{ fontSize: '1rem' }}>{badge.icon}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {leaderboard.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏆</div>
              <p>No data yet. Start saving food to appear here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
