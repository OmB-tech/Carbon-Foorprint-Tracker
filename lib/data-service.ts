import { db, isFirebaseInitialized } from "./firebase"
import { demoDb } from "./demo-auth"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore"

// Helper to get the right db instance
const getDb = () => (isFirebaseInitialized() ? db : demoDb)

// Mock data storage for when Firebase is not available
const mockStorage = {
  emissions: [],
  userProfiles: [],
  challenges: [],
  userChallenges: [],
  userBadges: [],
}

// User profile
export const createUserProfile = async (userId: string, data: any) => {
  if (!isFirebaseInitialized()) {
    // Use mock storage in demo mode
    const newProfile = {
      id: `demo-${Date.now()}`,
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockStorage.userProfiles.push(newProfile)
    return { id: newProfile.id }
  }

  const currentDb = getDb()
  return await addDoc(collection(currentDb, "userProfiles"), {
    userId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateUserProfile = async (profileId: string, data: any) => {
  if (!isFirebaseInitialized()) {
    // Update in mock storage
    const index = mockStorage.userProfiles.findIndex((p) => p.id === profileId)
    if (index !== -1) {
      mockStorage.userProfiles[index] = {
        ...mockStorage.userProfiles[index],
        ...data,
        updatedAt: new Date(),
      }
    }
    return
  }

  const currentDb = getDb()
  const profileRef = doc(currentDb, "userProfiles", profileId)
  await updateDoc(profileRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const getUserProfile = async (userId: string) => {
  if (!isFirebaseInitialized()) {
    // Get from mock storage
    const profile = mockStorage.userProfiles.find((p) => p.userId === userId)
    return profile || null
  }

  const currentDb = getDb()
  const q = query(collection(currentDb, "userProfiles"), where("userId", "==", userId))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  const docData = querySnapshot.docs[0]
  return { id: docData.id, ...docData.data() }
}

// Emissions data
export const logEmission = async (userId: string, userName: string, data: any) => {
  if (!isFirebaseInitialized()) {
    // Store in mock storage
    const newEmission = {
      id: `demo-emission-${Date.now()}`,
      userId,
      userName,
      ...data,
      createdAt: new Date(),
    }
    mockStorage.emissions.push(newEmission)
    return { id: newEmission.id }
  }

  const currentDb = getDb()
  return await addDoc(collection(currentDb, "emissions"), {
    userId,
    userName,
    ...data,
    createdAt: serverTimestamp(),
  })
}

export const getUserEmissions = async (userId: string) => {
  if (!isFirebaseInitialized()) {
    // Return from mock storage or sample data
    const userEmissions = mockStorage.emissions.filter((e) => e.userId === userId)

    if (userEmissions.length > 0) {
      return userEmissions
    }

    // Return sample data if no user emissions exist
    return [
      {
        id: "demo-1",
        userId,
        userName: "Demo User",
        category: "transport",
        activity: "car trip (15 km)",
        emissions: 3.0,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date(),
      },
      {
        id: "demo-2",
        userId,
        userName: "Demo User",
        category: "home",
        activity: "electricity usage",
        emissions: 2.5,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date(),
      },
    ]
  }

  const currentDb = getDb()
  const q = query(collection(currentDb, "emissions"), where("userId", "==", userId), orderBy("date", "desc"))

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getRecentEmissions = async (userId: string, limitCount = 10) => {
  if (!isFirebaseInitialized()) {
    // Return from mock storage or sample data
    const userEmissions = mockStorage.emissions
      .filter((e) => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitCount)

    if (userEmissions.length > 0) {
      return userEmissions
    }

    // Return sample data if no user emissions exist
    return [
      {
        id: "demo-1",
        userId,
        userName: "Demo User",
        category: "transport",
        activity: "car trip (15 km)",
        emissions: 3.0,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date(),
      },
      {
        id: "demo-2",
        userId,
        userName: "Demo User",
        category: "home",
        activity: "electricity usage",
        emissions: 2.5,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date(),
      },
    ]
  }

  const currentDb = getDb()
  const q = query(
    collection(currentDb, "emissions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Recent activities for all users
export const getRecentActivitiesForAllUsers = async (limitCount = 20) => {
  if (!isFirebaseInitialized()) {
    // Return from mock storage or sample data
    const allEmissions = mockStorage.emissions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitCount)

    if (allEmissions.length > 0) {
      return allEmissions.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      }))
    }

    // Return sample data if no emissions exist
    return [
      {
        id: "demo-1",
        userId: "demo-user-1",
        userName: "John Doe",
        category: "transport",
        activity: "car trip (15 km)",
        emissions: 3.0,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-2",
        userId: "demo-user-2",
        userName: "Jane Smith",
        category: "home",
        activity: "electricity usage",
        emissions: 2.5,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-3",
        userId: "demo-user-3",
        userName: "Alex Johnson",
        category: "food",
        activity: "vegetarian meal",
        emissions: 1.2,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
    ]
  }

  const currentDb = getDb()
  const q = query(collection(currentDb, "emissions"), orderBy("createdAt", "desc"), limit(limitCount))

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      // Convert Firestore timestamp to string for serialization
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    }
  })
}

// Aggregated statistics
export const fetchAggregatedStats = async () => {
  if (!isFirebaseInitialized()) {
    return {
      totalUsers: 157,
      totalEmissions: 12450,
      averageEmission: 8.2,
      totalActivities: 1893,
      totalReduction: 2340,
    }
  }

  try {
    const currentDb = getDb()
    const emissionsSnapshot = await getDocs(collection(currentDb, "emissions"))
    const usersSnapshot = await getDocs(collection(currentDb, "userProfiles"))

    const totalUsers = usersSnapshot.size
    let totalEmissions = 0
    let emissionsCount = 0
    let totalReduction = 0
    const totalActivities = emissionsSnapshot.size

    emissionsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.emissions) {
        totalEmissions += data.emissions
        emissionsCount++
      }
      if (data.reduction) {
        totalReduction += data.reduction
      }
    })

    return {
      totalUsers,
      totalEmissions,
      averageEmission: emissionsCount > 0 ? totalEmissions / emissionsCount : 0,
      totalActivities,
      totalReduction,
    }
  } catch (error) {
    console.error("Error fetching aggregated stats:", error)
    // Return default values if there's an error
    return {
      totalUsers: 0,
      totalEmissions: 0,
      averageEmission: 0,
      totalActivities: 0,
      totalReduction: 0,
    }
  }
}

// Challenges and gamification
export const getDailyChallenges = async () => {
  if (!isFirebaseInitialized()) {
    return [
      {
        id: "demo-challenge-1",
        title: "Walk or Bike Today",
        description: "Skip the car and walk or bike for short trips today",
        points: 50,
        category: "transport",
        active: true,
      },
      {
        id: "demo-challenge-2",
        title: "Meatless Monday",
        description: "Eat vegetarian meals all day to reduce your food emissions",
        points: 30,
        category: "food",
        active: true,
      },
      {
        id: "demo-challenge-3",
        title: "Energy Saver",
        description: "Reduce your electricity usage by 20% today",
        points: 40,
        category: "home",
        active: true,
      },
    ]
  }

  const currentDb = getDb()
  const q = query(collection(currentDb, "challenges"), where("active", "==", true))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const acceptChallenge = async (userId: string, challengeId: string) => {
  if (!isFirebaseInitialized()) {
    const newUserChallenge = {
      id: `demo-user-challenge-${Date.now()}`,
      userId,
      challengeId,
      status: "accepted",
      startedAt: new Date(),
    }
    mockStorage.userChallenges.push(newUserChallenge)
    return { id: newUserChallenge.id }
  }

  const currentDb = getDb()
  return await addDoc(collection(currentDb, "userChallenges"), {
    userId,
    challengeId,
    status: "accepted",
    startedAt: serverTimestamp(),
  })
}

export const completeChallenge = async (userChallengeId: string) => {
  if (!isFirebaseInitialized()) {
    const index = mockStorage.userChallenges.findIndex((uc) => uc.id === userChallengeId)
    if (index !== -1) {
      mockStorage.userChallenges[index] = {
        ...mockStorage.userChallenges[index],
        status: "completed",
        completedAt: new Date(),
      }
    }
    return
  }

  const currentDb = getDb()
  const challengeRef = doc(currentDb, "userChallenges", userChallengeId)
  await updateDoc(challengeRef, {
    status: "completed",
    completedAt: serverTimestamp(),
  })
}

export const getUserChallenges = async (userId: string) => {
  if (!isFirebaseInitialized()) {
    const userChallenges = mockStorage.userChallenges.filter((uc) => uc.userId === userId)

    if (userChallenges.length > 0) {
      return userChallenges
    }

    return [
      {
        id: "demo-user-challenge-1",
        userId,
        challengeId: "demo-challenge-1",
        status: "completed",
        startedAt: new Date(Date.now() - 86400000), // 1 day ago
        completedAt: new Date(),
      },
      {
        id: "demo-user-challenge-2",
        userId,
        challengeId: "demo-challenge-2",
        status: "accepted",
        startedAt: new Date(),
      },
    ]
  }

  const currentDb = getDb()
  const q = query(collection(currentDb, "userChallenges"), where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Badges and achievements
export const getUserBadges = async (userId: string) => {
  if (!isFirebaseInitialized()) {
    const userBadges = mockStorage.userBadges.filter((ub) => ub.userId === userId)

    if (userBadges.length > 0) {
      return userBadges
    }

    return [
      {
        id: "demo-badge-1",
        userId,
        badgeId: "transport-hero",
        earnedAt: new Date(Date.now() - 604800000), // 1 week ago
      },
      {
        id: "demo-badge-2",
        userId,
        badgeId: "food-conscious",
        earnedAt: new Date(Date.now() - 259200000), // 3 days ago
      },
    ]
  }

  const currentDb = getDb()
  const q = query(collection(currentDb, "userBadges"), where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Leaderboard
export const getLeaderboard = async (limitCount = 10) => {
  if (!isFirebaseInitialized()) {
    return [
      {
        id: "demo-user-1",
        userId: "demo-user-1",
        name: "John Doe",
        points: 850,
        totalReduction: 32,
      },
      {
        id: "demo-user-2",
        userId: "demo-user-2",
        name: "Jane Smith",
        points: 720,
        totalReduction: 28,
      },
      {
        id: "demo-user-3",
        userId: "demo-user-3",
        name: "Alex Johnson",
        points: 690,
        totalReduction: 25,
      },
      {
        id: "demo-user-4",
        userId: "demo-user-4",
        name: "Sam Wilson",
        points: 610,
        totalReduction: 22,
      },
      {
        id: "demo-user-5",
        userId: "demo-user-5",
        name: "Taylor Brown",
        points: 580,
        totalReduction: 20,
      },
    ]
  }

  // This is a simplified approach. In a real app, you'd have a more sophisticated
  // scoring system and possibly a separate collection for leaderboard entries
  const currentDb = getDb()
  const usersSnapshot = await getDocs(collection(currentDb, "userProfiles"))

  const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  // Sort by total emission reduction (this is just an example)
  users.sort((a, b) => (b.totalReduction || 0) - (a.totalReduction || 0))

  return users.slice(0, limitCount)
}

