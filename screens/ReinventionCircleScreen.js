// screens/ReinventionCircleScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { isProUser } from '../lib/paywall';
import PremiumUpsellModal from '../components/PremiumUpsellModal';
import { colors, typography, spacing, radii, shadows, tokens } from './theme';
import { getInitialChallenges } from '../config/challengesLibrary';

const { width } = Dimensions.get('window');

// ─── Tab config (2 tabs — Circles tab removed) ────────────────────────────────
const TABS = [
  { key: 'feed', label: 'Circle Feed', emoji: '🌸' },
  { key: 'challenges', label: 'Challenges', emoji: '🎯' },
];

// ─── Roadmap → Circle mapping ──────────────────────────────────────────────────
export const ROADMAP_CIRCLES = {
  new_city: {
    name: 'New City Girls 🏙️',
    description: 'Women landing in a new city and building their life from scratch.',
    emoji: '🏙️',
    roadmap_key: 'new_city',
  },
  tech_switch: {
    name: 'Tech Switchers 🖥️',
    description: 'Career-changers learning tech skills and landing their first tech role.',
    emoji: '🖥️',
    roadmap_key: 'tech_switch',
  },
  financial_glow_up: {
    name: 'Financial Glow-Up 💸',
    description: 'Women building financial literacy, savings habits, and money confidence.',
    emoji: '💸',
    roadmap_key: 'financial_glow_up',
  },
  physical_glow_up: {
    name: 'Physical Glow-Up 💪',
    description: 'Women showing up for their body — movement, sleep, and nourishment.',
    emoji: '💪',
    roadmap_key: 'physical_glow_up',
  },
  mental_glow_up: {
    name: 'Mental Glow-Up 🧠',
    description: 'Quiet minds, stronger mindsets, and emotional resilience — together.',
    emoji: '🧠',
    roadmap_key: 'mental_glow_up',
  },
};

// ─── Auto-join helper ──────────────────────────────────────────────────────────
// Call from RoadmapPlanScreen (or wherever a roadmap is activated).
//
// Usage:
//   import { autoJoinRoadmapCircle } from '../screens/ReinventionCircleScreen';
//   await autoJoinRoadmapCircle('tech_switch', user);
//
export async function autoJoinRoadmapCircle(roadmapKey, user) {
  if (!user || !roadmapKey) return;
  const circleSeed = ROADMAP_CIRCLES[roadmapKey];
  if (!circleSeed) return;

  try {
    // 1. Find or create the roadmap circle (keyed by roadmap_key column)
    let { data: existing, error: fetchError } = await supabase
      .from('circles')
      .select('id')
      .eq('roadmap_key', roadmapKey)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let circleId;

    if (!existing) {
      const { data: created, error: createError } = await supabase
        .from('circles')
        .insert([{
          name: circleSeed.name,
          description: circleSeed.description,
          emoji: circleSeed.emoji,
          roadmap_key: roadmapKey,
          is_seeded: true,
          created_by: user.id,
        }])
        .select('id')
        .single();

      if (createError) throw createError;
      circleId = created.id;

      await seedRoadmapChallenges(circleId, roadmapKey, user.id);
    } else {
      circleId = existing.id;
    }

    // 2. Add user to circle_members (ignore if already a member — unique constraint)
    const { error: memberError } = await supabase
      .from('circle_members')
      .insert([{ circle_id: circleId, user_id: user.id }]);

    // 23505 = unique_violation (already a member — that's fine)
    if (memberError && memberError.code !== '23505') throw memberError;

    // 3. Persist locally so we don't attempt re-join on every launch
    await AsyncStorage.setItem(`circle_joined_${roadmapKey}`, circleId);
  } catch (e) {
    console.warn('autoJoinRoadmapCircle error:', e);
  }
}

// ─── Seed challenges helper ────────────────────────────────────────────────────
// IMPORTANT: ends_at is GENERATED ALWAYS — never pass it on insert.
async function seedRoadmapChallenges(circleId, roadmapKey, userId) {
  const initial = getInitialChallenges(roadmapKey); // one per slot, order=1
  if (!initial?.length) return;

  const today = new Date().toISOString().split('T')[0];

  const rows = initial.map((ch) => ({
    circle_id: circleId,
    title: ch.title,
    description: ch.description,
    emoji: ch.emoji,
    total_days: ch.total_days,
    slot: ch.slot,
    order: ch.order,
    starts_at: today,
    created_by: userId ?? null,
    // ends_at: omitted — generated column
  }));

  const { error } = await supabase.from('challenges').insert(rows);
  if (error) console.warn('seedRoadmapChallenges error:', error);
}

// ─── Main screen component ────────────────────────────────────────────────────
export default function ReinventionCircleScreen() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  // Feed & filter state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState({ content: '' });
  const [activeFeedCircle, setActiveFeedCircle] = useState(null); // null = All

  // Comments state
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Circles state
  const [circles, setCircles] = useState([]);
  const [myCircleIds, setMyCircleIds] = useState([]); // circles the user belongs to
  const [loadingCircles, setLoadingCircles] = useState(true);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [showCircleModal, setShowCircleModal] = useState(false);
  const [showManageCircles, setShowManageCircles] = useState(false);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');

  // Challenges state
  const [challenges, setChallenges] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeMembers, setChallengeMembers] = useState([]); // challenges user has joined (persistent)
  const [completedToday, setCompletedToday] = useState([]);    // challenges completed today

  const postsChannelRef = useRef(null);
  const commentsChannelRef = useRef(null);

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const loadUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    const pro = await isProUser();
    setIsPro(pro);
  }, []);

  // ─── Posts ─────────────────────────────────────────────────────────────────
  // circle_posts now has an optional circle_id column — posts without one appear in "All".
  // NOTE: if circle_posts doesn't yet have circle_id, add the migration:
  //   ALTER TABLE circle_posts ADD COLUMN circle_id uuid REFERENCES circles(id) ON DELETE SET NULL;
  const fetchPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('circle_posts')
        .select('id, content, created_at, circle_id, user_id')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const posts = data || [];
      const userIds = [...new Set(posts.map((p) => p.user_id).filter(Boolean))];
      let nameMap = {};
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
        (profiles || []).forEach((p) => { nameMap[p.id] = p.display_name; });
      }
      setPosts(posts.map((p) => ({ ...p, display_name: nameMap[p.user_id] ?? null })));
    } catch (e) {
      console.error('fetchPosts', e);
      Alert.alert('Error', 'Could not load posts.');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const fetchComments = useCallback(async (postId) => {
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('circle_comments')
        .select('id, post_id, content, created_at, user_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const comments = data || [];
      const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
      let nameMap = {};
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
        (profiles || []).forEach((p) => { nameMap[p.id] = p.display_name; });
      }
      setComments(comments.map((c) => ({ ...c, display_name: nameMap[c.user_id] ?? null })));
    } catch (e) {
      console.error('fetchComments', e);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  // ─── Circles ───────────────────────────────────────────────────────────────
  const fetchCircles = useCallback(async (currentUser) => {
    try {
      setLoadingCircles(true);

      // All circles
      const { data, error } = await supabase
        .from('circles')
        .select(`
          id, name, description, emoji, roadmap_key, is_seeded, created_at,
          circle_members(count)
        `)
        .order('is_seeded', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;

      const shaped = (data || []).map((c) => ({
        ...c,
        members: c.circle_members?.[0]?.count ?? 0,
      }));
      setCircles(shaped);

      // Which ones does this user belong to?
      if (currentUser) {
        const { data: memberships } = await supabase
          .from('circle_members')
          .select('circle_id')
          .eq('user_id', currentUser.id);
        setMyCircleIds((memberships || []).map((m) => m.circle_id));
      }
    } catch (e) {
      console.error('fetchCircles', e);
    } finally {
      setLoadingCircles(false);
    }
  }, []);

  // ─── Challenges ────────────────────────────────────────────────────────────
  // Scoped to circles the user is a member of.
  // ends_at is a generated stored column — safe to read/filter on, never write it.
  const fetchChallenges = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: memberships, error: memberError } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', currentUser.id);

      if (memberError) throw memberError;

      const circleIds = (memberships || []).map((m) => m.circle_id);
      if (!circleIds.length) {
        setChallenges([]);
        return;
      }

      const { data, error } = await supabase
        .from('challenges')
        .select(`
          id, circle_id, title, description, emoji, total_days, starts_at, ends_at,
          challenge_completions(user_id, completed_on)
        `)
        .in('circle_id', circleIds)
        .gte('ends_at', today)
        .order('slot', { ascending: true });

      if (error) throw error;

      const shaped = (data || []).map((ch) => {
        const completionsToday = (ch.challenge_completions || []).filter(
          (c) => c.completed_on === today
        );
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(ch.ends_at) - new Date()) / 86400000)
        );
        return {
          ...ch,
          daysLeft,
          participants: ch.challenge_completions?.length ?? 0,
          completedBy: completionsToday.map((c) => c.user_id),
        };
      });
      setChallenges(shaped);
    } catch (e) {
      console.error('fetchChallenges', e);
    }
  }, []);

  // ─── Hydrate challenge membership + today completions on mount ───────────────
  const fetchJoinedChallenges = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      // Persistent membership (challenge_members table)
      const { data: memberData } = await supabase
        .from('challenge_members')
        .select('challenge_id')
        .eq('user_id', currentUser.id);
      if (memberData) setChallengeMembers(memberData.map((d) => d.challenge_id));

      // Today's completions (challenge_completions table)
      const { data: compData } = await supabase
        .from('challenge_completions')
        .select('challenge_id')
        .eq('user_id', currentUser.id)
        .eq('completed_on', today);
      if (compData) setCompletedToday(compData.map((d) => d.challenge_id));
    } catch (e) {
      console.warn('fetchJoinedChallenges error:', e);
    }
  }, []);

  // ─── Bootstrap ─────────────────────────────────────────────────────────────
  useFocusEffect(useCallback(() => {
  (async () => {
    await loadUser();
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    await Promise.all([
      fetchPosts(),
      fetchCircles(currentUser),
      fetchChallenges(currentUser),
      fetchJoinedChallenges(currentUser),
    ]);
  })();
}, [loadUser, fetchPosts, fetchCircles, fetchChallenges, fetchJoinedChallenges]));

  // Realtime posts
  useEffect(() => {
    const existing = supabase
      .getChannels()
      .find((ch) => ch.topic?.includes('circle_posts_realtime'));
    if (existing) supabase.removeChannel(existing);
    const channel = supabase
      .channel(`circle_posts_realtime_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'circle_posts' },
        (payload) => {
          // Attach current user's display_name so it renders immediately
          const name = user?.user_metadata?.display_name ?? null;
          setPosts((prev) => [{ ...payload.new, display_name: name }, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'circle_posts' },
        (payload) => setPosts((prev) => prev.filter((p) => p.id !== payload.old.id))
      )
      .subscribe();
    postsChannelRef.current = channel;
    return () => {
      if (postsChannelRef.current) supabase.removeChannel(postsChannelRef.current);
    };
  }, []);

  // Realtime comments
  useEffect(() => {
    if (commentsChannelRef.current) supabase.removeChannel(commentsChannelRef.current);
    if (!selectedPost) return;
    supabase
      .getChannels()
      .filter((ch) => ch.topic?.includes('circle_comments_realtime'))
      .forEach((ch) => supabase.removeChannel(ch));
    const channel = supabase
      .channel(`circle_comments_realtime_${selectedPost.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'circle_comments' },
        (payload) => {
          if (payload.new.post_id === selectedPost.id) {
            setComments((prev) => [...prev, payload.new]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'circle_comments' },
        (payload) => setComments((prev) => prev.filter((c) => c.id !== payload.old.id))
      )
      .subscribe();
    commentsChannelRef.current = channel;
    return () => {
      if (commentsChannelRef.current) supabase.removeChannel(commentsChannelRef.current);
    };
  }, [selectedPost]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handlePostSubmit = async () => {
    if (!newPost.content.trim()) return;
    if (!user) {
      Alert.alert('Please sign in', 'You need to be logged in to post.');
      return;
    }
    try {
      const insertPayload = {
        content: newPost.content.trim(),
        user_id: user.id,
      };
      // Include circle_id only if a circle chip is active
      if (activeFeedCircle) insertPayload.circle_id = activeFeedCircle;

      const { data, error } = await supabase
        .from('circle_posts')
        .insert([insertPayload])
        .select()
        .single();
      if (error) throw error;
      setNewPost({ content: '' });
      setPosts((prev) => [data, ...prev]);
    } catch (e) {
      Alert.alert('Error', 'Could not create the post.');
    }
  };

  const openPost = async (post) => {
    if (!isPro) {
      setShowUpsell(true);
      return;
    }
    setSelectedPost(post);
    await fetchComments(post.id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      Alert.alert('Please sign in');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('circle_comments')
        .insert([{ post_id: selectedPost.id, content: newComment.trim(), user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setNewComment('');
      setComments((prev) => [...prev, data]);
    } catch (e) {
      Alert.alert('Error', 'Could not add comment.');
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setComments([]);
    setNewComment('');
  };

  const handleJoinCircle = async (circleId) => {
    if (!user) {
      Alert.alert('Please sign in');
      return;
    }
    const { error } = await supabase
      .from('circle_members')
      .insert([{ circle_id: circleId, user_id: user.id }]);
    if (error && error.code !== '23505') {
      Alert.alert('Error', 'Could not join circle.');
      return;
    }
    setMyCircleIds((prev) => [...new Set([...prev, circleId])]);
    await fetchCircles(user);
    Alert.alert('Joined! 🌸', 'Welcome to your new circle.');
  };

  const handleLeaveCircle = async (circleId) => {
    if (!user) return;
    Alert.alert('Leave Circle', 'Are you sure you want to leave this circle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('circle_members')
            .delete()
            .eq('circle_id', circleId)
            .eq('user_id', user.id);
          if (error) {
            Alert.alert('Error', 'Could not leave circle.');
            return;
          }
          setMyCircleIds((prev) => prev.filter((id) => id !== circleId));
          if (activeFeedCircle === circleId) setActiveFeedCircle(null);
          await fetchCircles(user);
        },
      },
    ]);
  };

  const handleCreateCircle = async () => {
    if (!newCircleName.trim() || !user) return;
    const { data, error } = await supabase
      .from('circles')
      .insert([{
        name: newCircleName.trim(),
        description: newCircleDesc.trim(),
        created_by: user.id,
        is_seeded: false,
      }])
      .select()
      .single();
    if (error) {
      Alert.alert('Error', 'Could not create circle.');
      return;
    }
    await supabase
      .from('circle_members')
      .insert([{ circle_id: data.id, user_id: user.id }]);
    setMyCircleIds((prev) => [...new Set([...prev, data.id])]);
    setNewCircleName('');
    setNewCircleDesc('');
    setShowCreateCircle(false);
    await fetchCircles(user);
    Alert.alert('Circle created! 🌸', 'Invite your sisters to join.');
  };

  // Join a challenge (persistent — writes to challenge_members)
  const handleJoinChallenge = async (id) => {
    if (!user) { Alert.alert('Please sign in'); return; }
    const { error } = await supabase
      .from('challenge_members')
      .insert([{ challenge_id: id, user_id: user.id }]);
    if (error && error.code !== '23505') {
      Alert.alert('Error', 'Could not join challenge.');
      return;
    }
    setChallengeMembers((prev) => [...new Set([...prev, id])]);
    Alert.alert("You're in! 🎯", "Open the challenge anytime to mark it complete.");
  };

  // Mark today's completion (daily — writes to challenge_completions)
  const handleCompleteChallenge = async (id) => {
    if (!user) { Alert.alert('Please sign in'); return; }
    const { error } = await supabase
      .from('challenge_completions')
      .insert([{ challenge_id: id, user_id: user.id }]);
    // 23505 = unique_violation — already completed today, that's fine
    if (error && error.code !== '23505') {
      Alert.alert('Error', 'Could not record completion.');
      return;
    }
    setCompletedToday((prev) => [...new Set([...prev, id])]);
    await fetchChallenges(user);
    setShowChallengeModal(false);
    Alert.alert("Done! 🎉", "Your circle will see you showed up today.");
  };

  // ─── Derived data ──────────────────────────────────────────────────────────
  // My circles = circles the user has joined, for the filter strip
  const myCircles = circles.filter((c) => myCircleIds.includes(c.id));

  // Filtered posts: if a circle chip is active, show only that circle's posts
  const filteredPosts = activeFeedCircle
    ? posts.filter((p) => p.circle_id === activeFeedCircle)
    : posts;

  // When switching to a circle filter, pre-fill the composer's circle
  const handleCircleChipPress = (circleId) => {
    setActiveFeedCircle((prev) => prev === circleId ? null : circleId);
  };

  // ─── Render helpers ────────────────────────────────────────────────────────

  // Circle filter chip strip shown above the feed
  const renderCircleFilterStrip = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterStripScroll}
      contentContainerStyle={styles.filterStripContent}
    >
      {/* All chip */}
      <TouchableOpacity
        style={[styles.filterChip, activeFeedCircle === null && styles.filterChipActive]}
        onPress={() => setActiveFeedCircle(null)}
      >
        <Text style={[styles.filterChipText, activeFeedCircle === null && styles.filterChipTextActive]}>
          ✨ All
        </Text>
      </TouchableOpacity>

      {/* My circle chips */}
      {myCircles.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.filterChip, activeFeedCircle === c.id && styles.filterChipActive]}
          onPress={() => handleCircleChipPress(c.id)}
        >
          <Text style={[styles.filterChipText, activeFeedCircle === c.id && styles.filterChipTextActive]}>
            {c.emoji} {c.name.replace(/\s[\p{Emoji}]+$/u, '')}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Manage / join more */}
      <TouchableOpacity
        style={styles.filterChipManage}
        onPress={() => {
          if (!isPro) { setShowUpsell(true); return; }
          setShowManageCircles(true);
        }}
      >
        <Text style={styles.filterChipManageText}>+ Circles</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderFeed = () => (
    <FlatList
      data={isPro ? filteredPosts : posts.filter((p) => !p.circle_id)}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.tabContent}
      ListHeaderComponent={
        <>
          {/* Circle filter strip — pro only */}
          {isPro && renderCircleFilterStrip()}

          {isPro ? (
            <>
              <Text style={styles.sectionEyebrow}>SHARE WITH YOUR CIRCLE</Text>
              <View style={styles.eyebrowRule} />

              <View style={styles.postComposer}>
                <TextInput
                  placeholder="What is on your heart today?"
                  placeholderTextColor={colors.caption}
                  style={[styles.input, styles.inputMultiline]}
                  value={newPost.content}
                  onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={handlePostSubmit}>
                  <Text style={styles.btnPrimaryText}>
                    {activeFeedCircle
                      ? `POST TO ${(myCircles.find((c) => c.id === activeFeedCircle)?.name || 'CIRCLE').toUpperCase()}`
                      : 'POST TO ALL CIRCLES'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Free user upsell nudge */
            <TouchableOpacity style={styles.freeNudge} onPress={() => setShowUpsell(true)}>
              <Text style={styles.freeNudgeEmoji}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.freeNudgeTitle}>Join the conversation</Text>
                <Text style={styles.freeNudgeBody}>Go Premium to post, reply, and filter by circle.</Text>
              </View>
              <Text style={styles.freeNudgeCta}>Upgrade →</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionEyebrow, { marginTop: spacing.lg }]}>
            {isPro && activeFeedCircle
              ? `${myCircles.find((c) => c.id === activeFeedCircle)?.emoji} POSTS IN THIS CIRCLE`
              : 'RECENT POSTS'}
          </Text>
          <View style={styles.eyebrowRule} />
          {loadingPosts && <ActivityIndicator color={colors.deepRose} style={{ marginTop: 12 }} />}
        </>
      }
      renderItem={({ item }) => {
        const circle = circles.find((c) => c.id === item.circle_id);
        return (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() => openPost(item)}
            activeOpacity={isPro ? 0.7 : 1}
          >
            {circle && (
              <View style={styles.postCircleBadge}>
                <Text style={styles.postCircleBadgeText}>{circle.emoji} {circle.name.replace(/\s[\p{Emoji}]+$/u, '')}</Text>
              </View>
            )}
            <Text style={styles.postAuthor}>{item.display_name ?? 'Anonymous'}</Text>
            <Text numberOfLines={2} style={styles.postBody}>{item.content}</Text>
            <View style={styles.postFooter}>
              <Text style={styles.timestamp}>{format(new Date(item.created_at), 'PPP')}</Text>
              {isPro
                ? <Text style={styles.commentHint}>💬 Reply</Text>
                : <Text style={[styles.commentHint, { color: colors.caption }]}>🔒 Premium</Text>
              }
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        !loadingPosts ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyText}>
              {isPro && activeFeedCircle
                ? 'No posts in this circle yet — be the first to share.'
                : 'Be the first to share something beautiful.'}
            </Text>
          </View>
        ) : null
      }
    />
  );

  const renderChallenges = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionEyebrow}>ACTIVE GROUP CHALLENGES</Text>
      <View style={styles.eyebrowRule} />
      <Text style={styles.challengeIntro}>
        Challenges are how circles grow. Pick one, show up, and celebrate each other every step of the way.
      </Text>

      {challenges.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyText}>No active challenges right now. Check back soon.</Text>
        </View>
      )}

      {challenges.map((ch) => {
        const isMember = challengeMembers.includes(ch.id);
        const isDoneToday = completedToday.includes(ch.id);
        const pct = ch.participants > 0
          ? Math.round((ch.completedBy.length / ch.participants) * 100)
          : 0;

        return (
          <TouchableOpacity
            key={ch.id}
            style={styles.challengeCard}
            onPress={() => {
              setSelectedChallenge(ch);
              setShowChallengeModal(true);
            }}
          >
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeEmoji}>{ch.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeTitle}>{ch.title}</Text>
                <Text style={styles.challengeCircle}>
                  {circles.find((c) => c.id === ch.circle_id)?.name}
                </Text>
              </View>
              <View style={[styles.daysLeftBadge, ch.daysLeft <= 3 && styles.daysLeftUrgent]}>
                <Text style={[styles.daysLeftText, ch.daysLeft <= 3 && styles.daysLeftTextUrgent]}>
                  {ch.daysLeft}d left
                </Text>
              </View>
            </View>

            <Text style={styles.challengeDesc} numberOfLines={2}>{ch.description}</Text>

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {ch.completedBy.length} of {ch.participants} completed today
              </Text>
              <Text style={styles.progressLabel}>{pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillGreen, { width: `${pct}%` }]} />
            </View>

            <View style={styles.challengeFooter}>
              <View style={styles.completedNames}>
                {ch.completedBy.slice(0, 3).map((uid, i) => (
                  <View key={i} style={styles.completedPill}>
                    <Text style={styles.completedPillText}>✓ done today</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={isMember ? styles.joinedBtn : styles.joinBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  if (!isMember) handleJoinChallenge(ch.id);
                }}
              >
                <Text style={isMember ? styles.joinedBtnText : styles.joinBtnText}>
                  {isMember ? 'Joined ✓' : '+ Join'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      {/* ── Masthead ── */}
{/* ── Masthead ── */}
<View style={styles.masthead}>
  <Text style={styles.mastheadEyebrow}>The Reinvention Edit</Text>
  <View style={styles.mastheadRule} />
  <Text style={styles.mastheadTitle}>Reinvention Circle</Text>
  <Text style={styles.mastheadSub}>
    Where women rise together.
  </Text>
  <View style={styles.mastheadBottomRule} />
</View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const locked = !isPro && tab.key !== 'feed';
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
              onPress={() => {
                if (locked) {
                  setShowUpsell(true);
                  return;
                }
                setActiveTab(tab.key);
              }}
            >
              <Text style={styles.tabEmoji}>{locked ? '🔒' : tab.emoji}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'challenges' && renderChallenges()}
      </KeyboardAvoidingView>

      {/* ── Post comments modal ── */}
      <Modal visible={!!selectedPost} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalScreen}>
          <View style={styles.modalDragHandle} />
          <Text style={styles.postAuthor}>{selectedPost?.display_name ?? 'Anonymous'}</Text>
          <Text style={styles.modalBodyText}>{selectedPost?.content}</Text>
          <View style={styles.modalDivider} />
          <Text style={styles.sectionEyebrow}>REPLIES</Text>
          {loadingComments ? (
            <ActivityIndicator color={colors.deepRose} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => String(item.id)}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <View style={styles.commentCard}>
                  <Text style={styles.commentAuthor}>{item.display_name ?? 'Anonymous'}</Text>
                  <Text style={styles.commentBody}>{item.content}</Text>
                  <Text style={styles.timestamp}>{format(new Date(item.created_at), 'PPP p')}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No replies yet — be the first 💬</Text>
              }
            />
          )}
          <View style={styles.commentRow}>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a kind reply…"
              placeholderTextColor={colors.caption}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
            <Text style={styles.modalCloseBtnText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Manage Circles bottom sheet ── */}
      <Modal
        visible={showManageCircles}
        animationType="slide"
        transparent
        onRequestClose={() => setShowManageCircles(false)}
      >
        <View style={tokens.modalOverlay}>
          <View style={[tokens.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalHeading}>Your Circles</Text>
            <Text style={styles.modalBodyText}>
              Join circles to follow conversations and filter your feed.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {loadingCircles ? (
                <ActivityIndicator color={colors.deepRose} />
              ) : (
                circles.map((c) => {
                  const isMember = myCircleIds.includes(c.id);
                  return (
                    <View key={c.id} style={styles.manageCircleRow}>
                      <View style={styles.manageCircleEmojiBadge}>
                        <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.circleName}>{c.name}</Text>
                        <Text style={styles.circleDesc} numberOfLines={1}>{c.description}</Text>
                        <Text style={styles.memberCountLabel}>{c.members} members</Text>
                      </View>
                      {isMember ? (
                        <TouchableOpacity
                          style={styles.leaveBtn}
                          onPress={() => handleLeaveCircle(c.id)}
                        >
                          <Text style={styles.leaveBtnText}>Leave</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.joinBtn}
                          onPress={() => handleJoinCircle(c.id)}
                        >
                          <Text style={styles.joinBtnText}>Join</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.btnOutline, { marginTop: spacing.md }]}
              onPress={() => {
                setShowManageCircles(false);
                setShowCreateCircle(true);
              }}
            >
              <Text style={styles.btnOutlineText}>+ CREATE A NEW CIRCLE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowManageCircles(false)}
            >
              <Text style={styles.modalCloseBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Circle detail modal ── */}
      <Modal
        visible={showCircleModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCircleModal(false)}
      >
        <View style={tokens.modalOverlay}>
          <View style={[tokens.modalCard, { maxHeight: '80%' }]}>
            {selectedCircle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalEmoji}>{selectedCircle.emoji}</Text>
                <Text style={styles.modalHeading}>{selectedCircle.name}</Text>
                <Text style={styles.modalBodyText}>{selectedCircle.description}</Text>

                <View style={styles.dashboardStrip}>
                  <View style={styles.dashStat}>
                    <Text style={styles.dashNumber}>{selectedCircle.members}</Text>
                    <Text style={styles.dashLabel}>Members</Text>
                  </View>
                </View>

                <Text style={[styles.sectionEyebrow, { marginTop: spacing.lg }]}>ACTIVE CHALLENGES</Text>
                <View style={styles.eyebrowRule} />
                {challenges
                  .filter((c) => c.circle_id === selectedCircle.id)
                  .map((ch) => (
                    <View key={ch.id} style={styles.miniChallengeRow}>
                      <Text style={styles.miniChallengeEmoji}>{ch.emoji}</Text>
                      <Text style={styles.miniChallengeTitle}>{ch.title}</Text>
                      <Text style={styles.miniChallengeDays}>{ch.daysLeft}d left</Text>
                    </View>
                  ))}

                <TouchableOpacity
                  style={[styles.btnPrimary, { marginTop: spacing.lg }]}
                  onPress={() => setShowCircleModal(false)}
                >
                  <Text style={styles.btnPrimaryText}>CLOSE</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Create circle modal ── */}
      <Modal
        visible={showCreateCircle}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateCircle(false)}
      >
        <View style={tokens.modalOverlay}>
          <View style={tokens.modalCard}>
            <Text style={styles.modalHeading}>Start a New Circle</Text>
            <Text style={styles.modalBodyText}>
              Gather 3–6 women with a shared goal. Circles work best when everyone commits.
            </Text>
            <TextInput
              style={[styles.input, { marginTop: spacing.md }]}
              placeholder="Circle name (e.g. 'The Comeback Queens')"
              placeholderTextColor={colors.caption}
              value={newCircleName}
              onChangeText={setNewCircleName}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="What will you hold each other accountable for?"
              placeholderTextColor={colors.caption}
              value={newCircleDesc}
              onChangeText={setNewCircleDesc}
              multiline
            />
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleCreateCircle}
            >
              <Text style={styles.btnPrimaryText}>CREATE CIRCLE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: spacing.sm, alignItems: 'center' }}
              onPress={() => setShowCreateCircle(false)}
            >
              <Text style={typography.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Challenge detail modal ── */}
      <Modal
        visible={showChallengeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChallengeModal(false)}
      >
        <View style={tokens.modalOverlay}>
          <View style={tokens.modalCard}>
            {selectedChallenge && (
              <>
                <Text style={styles.modalEmoji}>{selectedChallenge.emoji}</Text>
                <Text style={styles.modalHeading}>{selectedChallenge.title}</Text>
                <Text style={styles.modalBodyText}>{selectedChallenge.description}</Text>

                <View style={[styles.dashboardStrip, { marginTop: spacing.md }]}>
                  <View style={styles.dashStat}>
                    <Text style={styles.dashNumber}>{selectedChallenge.daysLeft}</Text>
                    <Text style={styles.dashLabel}>Days Left</Text>
                  </View>
                  <View style={styles.dashDivider} />
                  <View style={styles.dashStat}>
                    <Text style={styles.dashNumber}>{selectedChallenge.participants}</Text>
                    <Text style={styles.dashLabel}>In Circle</Text>
                  </View>
                  <View style={styles.dashDivider} />
                  <View style={styles.dashStat}>
                    <Text style={styles.dashNumber}>{selectedChallenge.completedBy.length}</Text>
                    <Text style={styles.dashLabel}>Today ✓</Text>
                  </View>
                </View>

                <Text style={[styles.sectionEyebrow, { marginTop: spacing.md }]}>
                  WHO'S SHOWN UP TODAY
                </Text>
                <View style={styles.eyebrowRule} />
                <View style={[styles.completedNames, { marginBottom: spacing.md }]}>
                  {selectedChallenge.completedBy.length === 0 ? (
                    <Text style={styles.emptyText}>No one yet — be the first! 💪</Text>
                  ) : (
                    selectedChallenge.completedBy.slice(0, 5).map((uid, i) => (
                      <View key={i} style={styles.completedPill}>
                        <Text style={styles.completedPillText}>✓ joined</Text>
                      </View>
                    ))
                  )}
                </View>

                {!challengeMembers.includes(selectedChallenge.id) ? (
                  // Not yet joined — show Join button
                  <TouchableOpacity
                    style={styles.markCompleteBtn}
                    onPress={() => handleJoinChallenge(selectedChallenge.id)}
                  >
                    <Text style={styles.markCompleteBtnText}>+ JOIN THIS CHALLENGE</Text>
                  </TouchableOpacity>
                ) : completedToday.includes(selectedChallenge.id) ? (
                  // Joined and already completed today
                  <View style={styles.completedBanner}>
                    <Text style={styles.completedBannerText}>✓ Completed Today</Text>
                  </View>
                ) : (
                  // Joined but not yet completed today
                  <TouchableOpacity
                    style={styles.markCompleteBtn}
                    onPress={() => handleCompleteChallenge(selectedChallenge.id)}
                  >
                    <Text style={styles.markCompleteBtnText}>✓  MARK AS COMPLETE</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={{ marginTop: spacing.sm, alignItems: 'center' }}
                  onPress={() => setShowChallengeModal(false)}
                >
                  <Text style={typography.modalCancel}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Premium upsell ── */}
      <PremiumUpsellModal visible={showUpsell} onClose={() => setShowUpsell(false)} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },

  // ── Masthead ────────────────────────────────────────────────────────────────
  masthead: {
    alignItems: 'center',
    paddingTop: spacing.screenPaddingTop,
    paddingHorizontal: spacing.screenPaddingH,
    paddingBottom: spacing.xl,
    backgroundColor: colors.warmWhite,
    position: 'relative',
  },
  mastheadEyebrow: {
    ...typography.eyebrow,
    fontSize: 9,
    letterSpacing: 3.5,
    color: colors.clay,
    marginBottom: spacing.sm,
  },
  mastheadRule: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.deepRose,
    marginBottom: spacing.sm,
  },
  mastheadTitle: {
    fontFamily: 'DancingScript',
    fontSize: 40,
    color: colors.ink,
    lineHeight: 58,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  mastheadSub: {
    fontFamily: 'serif',
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.bodyMuted,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

mastheadBottomRule: {
  width: '100%',
  height: 1.5,
  backgroundColor: colors.ink,
  marginTop: spacing.md,
},

  // ── Tab bar ─────────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.softBorder,
    backgroundColor: colors.warmWhite,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.deepRose,
  },
  tabEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.caption,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: colors.deepRose,
  },

  // ── Circle filter strip ──────────────────────────────────────────────────────
  filterStripScroll: {
    marginBottom: spacing.md,
  },
  filterStripContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  filterChipActive: {
    backgroundColor: colors.deepRose,
    borderColor: colors.deepRose,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.bodyMuted,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filterChipManage: {
    borderWidth: 1.5,
    borderColor: colors.roseTint20,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.roseTint08,
  },
  filterChipManageText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.deepRose,
  },

  // ── Section labels ───────────────────────────────────────────────────────────
  sectionEyebrow: {
    ...typography.eyebrow,
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  eyebrowRule: {
    height: 1,
    backgroundColor: colors.clayRule,
    marginBottom: spacing.md,
    flex: 0,
  },

  tabContent: {
    padding: spacing.screenPaddingH,
    paddingBottom: 100,
  },

  // ── Inputs ──────────────────────────────────────────────────────────────────
  input: {
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    fontSize: 14,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────────
  btnPrimary: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  btnPrimaryText: {
    ...typography.buttonPrimary,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.roseTint20,
    borderRadius: radii.lg,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.deepRose,
  },

  // ── Feed ────────────────────────────────────────────────────────────────────
  postComposer: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.card,
  },
  postCircleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.roseTint08,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.roseTint20,
  },
  postCircleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.deepRose,
  },
  postTitle: {
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  postAuthor: {
    ...typography.badge,
    color: colors.ink,
    marginBottom: 4,
  },
  postBody: {
    ...typography.body,
    color: colors.bodyMuted,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  timestamp: {
    ...typography.caption,
  },
  commentHint: {
    fontSize: 12,
    color: colors.dustyRose,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.caption,
    textAlign: 'center',
  },

  // ── Dashboard strip ──────────────────────────────────────────────────────────
  dashboardStrip: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  dashStat: {
    flex: 1,
    alignItems: 'center',
  },
  dashNumber: {
    ...typography.sectionTitle,
    color: colors.deepRose,
  },
  dashLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  dashDivider: {
    width: 1,
    backgroundColor: colors.softBorder,
    marginVertical: 4,
  },

  // ── Manage circles row ───────────────────────────────────────────────────────
  manageCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    gap: spacing.sm,
  },
  manageCircleEmojiBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.roseTint08,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Circles ─────────────────────────────────────────────────────────────────
  circleName: {
    ...typography.actionLabel,
    marginBottom: 2,
  },
  circleDesc: {
    ...typography.caption,
    color: colors.bodyMuted,
    lineHeight: 18,
  },
  memberCountLabel: {
    ...typography.caption,
    color: colors.bodyMuted,
    marginTop: 2,
  },
  leaveBtn: {
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  leaveBtnText: {
    ...typography.badge,
    color: colors.bodyMuted,
  },

  // ── Challenges ───────────────────────────────────────────────────────────────
  challengeIntro: {
    ...typography.body,
    color: colors.bodyMuted,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  challengeCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  challengeEmoji: { fontSize: 26, marginTop: 2 },
  challengeTitle: {
    ...typography.actionLabel,
    marginBottom: 2,
  },
  challengeCircle: {
    ...typography.caption,
    color: colors.bodyMuted,
  },
  daysLeftBadge: {
    backgroundColor: colors.roseTint08,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.roseTint20,
  },
  daysLeftUrgent: {
    backgroundColor: 'rgba(160,97,58,0.10)',
    borderColor: colors.clay,
  },
  daysLeftText: {
    ...typography.badge,
  },
  daysLeftTextUrgent: { color: colors.clay },
  challengeDesc: {
    ...typography.body,
    color: colors.bodyMuted,
    marginBottom: spacing.sm,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  completedNames: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  completedPill: {
    backgroundColor: 'rgba(90,115,88,0.10)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(90,115,88,0.20)',
  },
  completedPillText: {
    fontSize: 11,
    color: colors.sage,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    minWidth: 72,
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.white,
  },
  completedBtn: {
    backgroundColor: colors.sage,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    minWidth: 72,
    alignItems: 'center',
  },
  completedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.white,
  },
  joinedBtn: {
    backgroundColor: colors.sage,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    minWidth: 72,
    alignItems: 'center',
  },
  joinedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.white,
  },
  markCompleteBtn: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  markCompleteBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.white,
  },
  completedBanner: {
    backgroundColor: colors.sage,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  completedBannerText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.white,
  },

  // ── Progress bars ────────────────────────────────────────────────────────────
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.bodyMuted,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.roseTint08,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.deepRose,
    borderRadius: 2,
  },
  progressFillGreen: {
    height: '100%',
    backgroundColor: colors.sage,
    borderRadius: 2,
  },

  // ── Modals ───────────────────────────────────────────────────────────────────
  modalScreen: {
    flex: 1,
    backgroundColor: colors.warmWhite,
    padding: spacing.screenPaddingH,
    paddingTop: spacing.screenPaddingTop,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.fawn,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalEmoji: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalHeading: {
    ...typography.sectionTitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalBodyText: {
    ...typography.body,
    color: colors.bodyMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.softBorder,
    marginBottom: spacing.md,
  },
  commentCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
  },
  commentAuthor: {
    ...typography.badge,
    color: colors.ink,
    marginBottom: 2,
  },
  commentBody: { ...typography.body },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.softBorder,
    borderRadius: radii.sm,
    padding: spacing.sm,
    backgroundColor: colors.card,
    fontSize: 14,
    color: colors.ink,
  },
  sendBtn: {
    backgroundColor: colors.deepRose,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.white,
  },
  modalCloseBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  modalCloseBtnText: { ...typography.modalCancel },

  // Mini challenge row (inside circle modal)
  miniChallengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    gap: spacing.sm,
  },
  miniChallengeEmoji: { fontSize: 18 },
  miniChallengeTitle: {
    ...typography.actionLabel,
    flex: 1,
  },
  miniChallengeDays: {
    ...typography.caption,
    color: colors.clay,
  },

  // ── Free user upsell nudge ───────────────────────────────────────────────────
  freeNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.roseTint08,
    borderWidth: 1,
    borderColor: colors.roseTint20,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  freeNudgeEmoji: { fontSize: 22 },
  freeNudgeTitle: {
    ...typography.actionLabel,
    color: colors.deepRose,
    marginBottom: 2,
  },
  freeNudgeBody: {
    ...typography.caption,
    color: colors.bodyMuted,
  },
  freeNudgeCta: {
    ...typography.badge,
    color: colors.deepRose,
    fontWeight: '700',
  },
});