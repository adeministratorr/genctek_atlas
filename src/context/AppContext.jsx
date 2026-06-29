import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth as getSecondaryAuth,
} from "firebase/auth";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { db, auth, firebaseConfig } from "../firebase/config";

// Import local static data
import themesData from "../data/themes.json";
import citiesData from "../data/cities.json";
import { seedEvents, seedProjects, seedGroups } from "../data/seedData";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolsData, setSchoolsData] = useState({});
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // null | 'event-register' | 'project-register' | 'login' | 'teacher-register' | 'apply-event' | 'event-edit' | 'student-register' | 'user-profile'
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // null | 'admin' | 'teacher' | 'student' | 'principal' | 'coordinator'
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // The event currently being edited
  const [isUsingMockData, setIsUsingMockData] = useState(
    auth.config.apiKey ? auth.config.apiKey.includes("DummyKey") : true,
  );

  // Phase 2 Study Groups states
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupAnnouncements, setGroupAnnouncements] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);

  // Phase 6 School Profile states
  const [schoolStudents, setSchoolStudents] = useState([]);
  const [schoolGroups, setSchoolGroups] = useState([]);
  const [schoolDataLoading, setSchoolDataLoading] = useState(false);

  // Phase 8 PWA & Offline states
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Direct Messaging states
  const [directMessages, setDirectMessages] = useState([]);
  const [chatContacts, setChatContacts] = useState([]);

  // Notifications & Announcements states
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [filters, setFilters] = useState({
    theme: "",
    format: "",
    search: "",
  });

  // Fetch schools dynamically for a given city plaka and merge with custom/edited schools.
  // This helper returns data without changing shared UI state, so components can avoid
  // overwriting each other's city-specific school lists.
  const loadSchoolsDataForCity = useCallback(async (cityAd) => {
    if (!cityAd) {
      return {};
    }
    const matchedCity = citiesData.find(
      (c) => c.ad.toLowerCase() === cityAd.toLowerCase(),
    );
    if (!matchedCity) {
      return {};
    }

    // 1. Fetch static schools
    const response = await fetch(`/data/schools/${matchedCity.plaka}.json`);
    if (!response.ok) throw new Error("Okul verisi yüklenemedi");
    const staticData = await response.json();

    // Deep copy staticData to avoid mutating cached responses
    const mergedData = JSON.parse(JSON.stringify(staticData));

    // 2. Fetch custom/edited schools from Firestore or LocalStorage
    let customSchoolsList = [];
    if (!auth.config.apiKey.includes("DummyKey")) {
      try {
        const q = query(
          collection(db, "custom_schools"),
          where("il", "==", cityAd),
        );
        const customSchoolsTimeout = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Custom schools fetch timeout")),
            2500,
          ),
        );
        const querySnapshot = await Promise.race([
          getDocs(q),
          customSchoolsTimeout,
        ]);
        querySnapshot.forEach((doc) => {
          customSchoolsList.push({ id: doc.id, ...doc.data() });
        });
      } catch (error) {
        console.warn(
          "Ozel okul verileri yuklenemedi, statik okul listesi kullaniliyor:",
          error,
        );
      }
    } else {
      const localSchools = localStorage.getItem("mock_custom_schools");
      if (localSchools) {
        customSchoolsList = JSON.parse(localSchools).filter(
          (s) => s.il.toLowerCase() === cityAd.toLowerCase(),
        );
      }
    }

    // 3. Merge custom schools into matched districts
    customSchoolsList.forEach((customSchool) => {
      const district = customSchool.ilce.toUpperCase(); // Ensure district key is uppercase
      if (!mergedData[district]) {
        mergedData[district] = [];
      }

      // Check if this is an override of a static school
      if (customSchool.originalId) {
        const idx = mergedData[district].findIndex(
          (s) =>
            s.id === customSchool.originalId ||
            s.ad === customSchool.originalAd,
        );
        if (idx !== -1) {
          mergedData[district][idx] = {
            id: customSchool.id,
            ad: customSchool.ad,
            website: customSchool.website,
          };
          return;
        }
      }

      // Otherwise, add it if it doesn't exist already
      const exists = mergedData[district].some(
        (s) => s.ad === customSchool.ad,
      );
      if (!exists) {
        mergedData[district].push({
          id: customSchool.id,
          ad: customSchool.ad,
          website: customSchool.website,
        });
      }
    });

    // Ensure every school has a stable ID for editing reference
    Object.keys(mergedData).forEach((dist) => {
      mergedData[dist] = mergedData[dist].map((school, index) => {
        if (!school.id) {
          return {
            ...school,
            id: `static-${matchedCity.plaka}-${dist.toLowerCase()}-${index}`,
          };
        }
        return school;
      });
    });

    return mergedData;
  }, []);

  // Fetch schools into the shared context state for forms and dashboards.
  const loadSchoolsForCity = useCallback(async (cityAd) => {
    if (!cityAd) {
      setSchoolsData({});
      return;
    }

    setSchoolsLoading(true);
    try {
      const mergedData = await loadSchoolsDataForCity(cityAd);
      setSchoolsData(mergedData);
    } catch (error) {
      console.error("Okul verileri yuklenirken hata:", error);
      setSchoolsData({});
    } finally {
      setSchoolsLoading(false);
    }
  }, [loadSchoolsDataForCity]);

  // Add Custom School
  const addCustomSchool = useCallback(
    async (schoolData) => {
      const newSchool = {
        ...schoolData,
        olusturmaTarihi: new Date().toISOString(),
      };

      let schoolId;
      if (!auth.config.apiKey.includes("DummyKey")) {
        const docRef = await addDoc(
          collection(db, "custom_schools"),
          newSchool,
        );
        schoolId = docRef.id;
      } else {
        schoolId = "mock-school-" + Date.now();
        const localSchools = localStorage.getItem("mock_custom_schools");
        const currentList = localSchools ? JSON.parse(localSchools) : [];
        const updatedList = [{ id: schoolId, ...newSchool }, ...currentList];
        localStorage.setItem(
          "mock_custom_schools",
          JSON.stringify(updatedList),
        );
      }
      loadSchoolsForCity(schoolData.il);
      return schoolId;
    },
    [loadSchoolsForCity],
  );

  // Update/Edit Custom School (Supports Static overrides too)
  const updateCustomSchool = useCallback(
    async (schoolId, schoolData) => {
      const updatedData = {
        ...schoolData,
        guncellemeTarihi: new Date().toISOString(),
      };

      if (!auth.config.apiKey.includes("DummyKey")) {
        if (schoolId && !schoolId.startsWith("static-")) {
          const docRef = doc(db, "custom_schools", schoolId);
          await updateDoc(docRef, updatedData);
        } else {
          // Static school override: save as a new custom school linking back
          await addDoc(collection(db, "custom_schools"), {
            originalId: schoolId,
            originalAd: schoolData.originalAd || schoolData.ad,
            ...updatedData,
          });
        }
      } else {
        const localSchools = localStorage.getItem("mock_custom_schools");
        const currentList = localSchools ? JSON.parse(localSchools) : [];
        let updatedList;
        if (schoolId && !schoolId.startsWith("static-")) {
          updatedList = currentList.map((s) =>
            s.id === schoolId ? { ...s, ...updatedData } : s,
          );
        } else {
          const mockId = "mock-school-" + Date.now();
          updatedList = [
            {
              id: mockId,
              originalId: schoolId,
              originalAd: schoolData.originalAd || schoolData.ad,
              ...updatedData,
            },
            ...currentList,
          ];
        }
        localStorage.setItem(
          "mock_custom_schools",
          JSON.stringify(updatedList),
        );
      }
      loadSchoolsForCity(schoolData.il);
    },
    [loadSchoolsForCity],
  );

  // Fetch teacher profile from Firestore (used in onAuthStateChanged flow)
  // eslint-disable-next-line no-unused-vars
  const fetchTeacherProfile = useCallback(
    async (uid) => {
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          const docRef = doc(db, "teachers", uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTeacherProfile(docSnap.data());
            // Auto-load school data for teacher's city
            if (docSnap.data().il) {
              loadSchoolsForCity(docSnap.data().il);
            }
          }
        }
      } catch (error) {
        console.error("Teacher profile fetch error:", error);
      }
    },
    [loadSchoolsForCity],
  );

  // Fetch students for logged-in teacher
  const fetchStudents = useCallback(async (teacherUid) => {
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const q = query(
          collection(db, "students"),
          where("ogretmenId", "==", teacherUid),
          orderBy("olusturmaTarihi", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const studentList = [];
        querySnapshot.forEach((doc) => {
          studentList.push({ id: doc.id, ...doc.data() });
        });
        setStudents(studentList);
      } else {
        // Mock students fallback
        const localStudents = localStorage.getItem("mock_students");
        if (localStudents) {
          setStudents(JSON.parse(localStudents));
        } else {
          setStudents([]);
        }
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, []);

  // Fetch school details (students and groups) for School Profile Modal
  const fetchSchoolDetails = useCallback(async (schoolName) => {
    if (!schoolName) return;
    setSchoolDataLoading(true);
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const usersRef = collection(db, "users");
        const q1 = query(
          usersRef,
          where("role", "==", "student"),
          where("schoolId", "==", schoolName),
        );
        const q2 = query(
          usersRef,
          where("role", "==", "student"),
          where("okul", "==", schoolName),
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const studentMap = new Map();

        snap1.forEach((doc) => {
          studentMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        snap2.forEach((doc) => {
          studentMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        const studentList = Array.from(studentMap.values()).sort(
          (a, b) => (b.xp || 0) - (a.xp || 0),
        );
        setSchoolStudents(studentList);

        const groupsRef = collection(db, "groups");
        const gq = query(groupsRef, where("schoolId", "==", schoolName));
        const groupsSnap = await getDocs(gq);
        const groupList = [];
        groupsSnap.forEach((doc) => {
          groupList.push({ id: doc.id, ...doc.data() });
        });
        setSchoolGroups(groupList);
      } else {
        const localUsers = localStorage.getItem("mock_users");
        const allUsers = localUsers ? JSON.parse(localUsers) : [];
        const studentList = allUsers
          .filter(
            (u) =>
              u.role === "student" &&
              (u.schoolId === schoolName || u.okul === schoolName),
          )
          .sort((a, b) => (b.xp || 0) - (a.xp || 0));
        setSchoolStudents(studentList);

        const localGroups = localStorage.getItem("mock_groups");
        const allGroups = localGroups ? JSON.parse(localGroups) : [];
        const groupList = allGroups.filter(
          (g) => g.schoolId === schoolName || g.okul === schoolName,
        );
        setSchoolGroups(groupList);
      }
    } catch (error) {
      console.error("Error fetching school details:", error);
    } finally {
      setSchoolDataLoading(false);
    }
  }, []);

  // Fetch event applications
  const fetchApplications = useCallback(
    async (
      isAdmin = false,
      teacherUid = null,
      isCoordinator = false,
      coordinatorCity = "",
      isCommission = false,
    ) => {
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          let q;
          const appRef = collection(db, "event_applications");
          if (isAdmin || isCoordinator || isCommission) {
            q = query(appRef, orderBy("olusturmaTarihi", "desc"));
          } else if (teacherUid) {
            q = query(
              appRef,
              where("ogretmenId", "==", teacherUid),
              orderBy("olusturmaTarihi", "desc"),
            );
          } else {
            return;
          }

          const querySnapshot = await getDocs(q);
          let appList = [];
          querySnapshot.forEach((doc) => {
            appList.push({ id: doc.id, ...doc.data() });
          });

          if ((isCoordinator || isCommission) && coordinatorCity) {
            appList = appList.filter(
              (app) => app.ogretmenBilgi?.il === coordinatorCity,
            );
          }
          setApplications(appList);
        } else {
          // Mock applications fallback
          const localApps = localStorage.getItem("mock_event_applications");
          if (localApps) {
            let parsedApps = JSON.parse(localApps);
            if ((isCoordinator || isCommission) && coordinatorCity) {
              parsedApps = parsedApps.filter(
                (a) => a.ogretmenBilgi?.il === coordinatorCity,
              );
            } else if (!isAdmin && teacherUid) {
              parsedApps = parsedApps.filter(
                (a) => a.ogretmenId === teacherUid,
              );
            }
            setApplications(parsedApps);
          } else {
            setApplications([]);
          }
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    },
    [],
  );

  // Fetch Study Groups for a user based on role/city
  const fetchGroups = useCallback(
    async (uid, role, city = "", schoolId = "") => {
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          const groupsRef = collection(db, "groups");
          let q;
          if (role === "admin") {
            q = query(groupsRef, orderBy("olusturmaTarihi", "desc"));
          } else if (
            (role === "coordinator" || role === "commission") &&
            city
          ) {
            q = query(
              groupsRef,
              where("il", "==", city),
              orderBy("olusturmaTarihi", "desc"),
            );
          } else if (role === "principal" && schoolId) {
            q = query(
              groupsRef,
              where("schoolId", "==", schoolId),
              orderBy("olusturmaTarihi", "desc"),
            );
          } else if (role === "student" && schoolId) {
            q = query(
              groupsRef,
              where("schoolId", "==", schoolId),
              orderBy("olusturmaTarihi", "desc"),
            );
          } else {
            // Teachers see groups they are members of
            q = query(
              groupsRef,
              where("members", "array-contains", uid),
              orderBy("olusturmaTarihi", "desc"),
            );
          }

          const querySnapshot = await getDocs(q);
          let list = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });

          // Seed if completely empty in Firestore
          if (list.length === 0) {
            const allGroupsSnap = await getDocs(groupsRef);
            if (allGroupsSnap.empty) {
              for (const g of seedGroups) {
                await addDoc(groupsRef, g);
              }
              // Re-fetch filtered query
              const reSnapshot = await getDocs(q);
              const reList = [];
              reSnapshot.forEach((doc) => {
                reList.push({ id: doc.id, ...doc.data() });
              });
              list = reList;
            }
          }
          setGroups(list);
        } else {
          // Mock mode groups
          const local = localStorage.getItem("mock_groups");
          let list = local ? JSON.parse(local) : [];

          if (list.length === 0) {
            // Dynamically add active user to the first two groups so they see them immediately
            const seeded = seedGroups.map((g, idx) => {
              const members = [...(g.members || [])];
              if (uid && idx < 2 && !members.includes(uid)) {
                members.push(uid);
              }
              return { ...g, id: `seed-group-${idx}`, members };
            });
            localStorage.setItem("mock_groups", JSON.stringify(seeded));
            list = seeded;
          }

          if (role !== "admin") {
            if ((role === "coordinator" || role === "commission") && city) {
              list = list.filter((g) => g.il === city);
            } else if (role === "principal" && schoolId) {
              list = list.filter((g) => g.schoolId === schoolId);
            } else if (role === "student" && schoolId) {
              list = list.filter(
                (g) => g.schoolId === schoolId || g.members?.includes(uid),
              );
            } else {
              list = list.filter((g) => g.members?.includes(uid));
            }
          }
          setGroups(list);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    },
    [],
  );

  // Notifications & Announcements Actions
  const fetchNotifications = useCallback((currentUserId) => {
    if (!currentUserId) return () => {};
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", currentUserId),
        );
        const unsubscribe = onSnapshot(q, (snap) => {
          const list = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          list.sort((a, b) => new Date(b.date) - new Date(a.date));
          setNotifications(list);
        });
        return unsubscribe;
      } else {
        const local = localStorage.getItem("mock_notifications");
        const list = local ? JSON.parse(local) : [];
        const filtered = list.filter((n) => n.userId === currentUserId);
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTimeout(() => setNotifications(filtered), 0);
        return () => {};
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return () => {};
    }
  }, []);

  const fetchAnnouncements = useCallback(() => {
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const q = query(collection(db, "announcements"));
        const unsubscribe = onSnapshot(q, (snap) => {
          const list = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          list.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAnnouncements(list);
        });
        return unsubscribe;
      } else {
        const local = localStorage.getItem("mock_announcements");
        const list = local ? JSON.parse(local) : [];
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTimeout(() => setAnnouncements(list), 0);
        return () => {};
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      return () => {};
    }
  }, []);

  const createNotification = useCallback(
    async (userId, title, icerik, type = "info", link = "") => {
      if (!userId) return;
      const newNotif = {
        userId,
        title,
        icerik,
        type,
        link,
        date: new Date().toISOString(),
        read: false,
      };

      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          const docRef = await addDoc(
            collection(db, "notifications"),
            newNotif,
          );
          return docRef.id;
        } else {
          const local = localStorage.getItem("mock_notifications");
          const list = local ? JSON.parse(local) : [];
          const notifId =
            "mock-notif-" +
            Date.now() +
            Math.random().toString(36).substr(2, 5);
          const notifWithId = { id: notifId, ...newNotif };
          list.push(notifWithId);
          localStorage.setItem("mock_notifications", JSON.stringify(list));
          if (user && user.uid === userId) {
            fetchNotifications(user.uid);
          }
          return notifId;
        }
      } catch (err) {
        console.error("Error creating notification:", err);
      }
    },
    [user, fetchNotifications],
  );

  // Helper function to award XP to user
  const awardXpToUser = useCallback(
    async (uid, xpAmount) => {
      try {
        let oldXp = 0;
        let newXp = 0;

        if (!auth.config.apiKey.includes("DummyKey")) {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            oldXp = userSnap.data().xp || 0;
            newXp = oldXp + xpAmount;
            await updateDoc(userRef, { xp: newXp });

            // If current logged-in user profile, update state
            if (user && user.uid === uid) {
              setUserProfile((prev) => (prev ? { ...prev, xp: newXp } : null));
            }
          }
        } else {
          const local = localStorage.getItem("mock_users");
          if (local) {
            const parsed = JSON.parse(local);
            const idx = parsed.findIndex((u) => u.uid === uid);
            if (idx !== -1) {
              oldXp = parsed[idx].xp || 0;
              newXp = oldXp + xpAmount;
              parsed[idx].xp = newXp;
              localStorage.setItem("mock_users", JSON.stringify(parsed));

              if (user && user.uid === uid) {
                setUserProfile(parsed[idx]);
              }
            }
          }
        }

        const oldLevel = Math.floor(oldXp / 100) + 1;
        const newLevel = Math.floor(newXp / 100) + 1;

        if (newLevel > oldLevel) {
          await createNotification(
            uid,
            "Seviye Atladınız! 🎉",
            `Tebrikler, yeni bir seviyeye ulaştınız! Artık Seviye ${newLevel} oldunuz.`,
            "info",
            "profile",
          );
        }
      } catch (err) {
        console.error("Error awarding XP:", err);
      }
    },
    [user, createNotification],
  );

  const awardBadgeToUser = useCallback(
    async (uid, badgeName) => {
      try {
        let updatedBadges = [];
        let alreadyHasBadge = false;

        if (!auth.config.apiKey.includes("DummyKey")) {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentBadges = userSnap.data().badges || [];
            if (currentBadges.includes(badgeName)) {
              alreadyHasBadge = true;
            } else {
              updatedBadges = [...currentBadges, badgeName];
              await updateDoc(userRef, { badges: updatedBadges });

              // If current logged-in user profile, update state
              if (user && user.uid === uid) {
                setUserProfile((prev) =>
                  prev ? { ...prev, badges: updatedBadges } : null,
                );
              }
            }
          }
        } else {
          const local = localStorage.getItem("mock_users");
          if (local) {
            const parsed = JSON.parse(local);
            const idx = parsed.findIndex((u) => u.uid === uid);
            if (idx !== -1) {
              const currentBadges = parsed[idx].badges || [];
              if (currentBadges.includes(badgeName)) {
                alreadyHasBadge = true;
              } else {
                updatedBadges = [...currentBadges, badgeName];
                parsed[idx].badges = updatedBadges;
                localStorage.setItem("mock_users", JSON.stringify(parsed));

                if (user && user.uid === uid) {
                  setUserProfile(parsed[idx]);
                }
              }
            }
          }
        }

        if (!alreadyHasBadge && updatedBadges.includes(badgeName)) {
          await createNotification(
            uid,
            "Yeni Rozet Kazanıldı! 🏆",
            `Tebrikler, '${badgeName}' rozetini kazandınız!`,
            "success",
            "profile",
          );
        }
      } catch (err) {
        console.error("Error awarding badge:", err);
      }
    },
    [user, createNotification],
  );

  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      if (!user) return;
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          await updateDoc(doc(db, "notifications", notificationId), {
            read: true,
          });
        } else {
          const local = localStorage.getItem("mock_notifications");
          const list = local ? JSON.parse(local) : [];
          const updated = list.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          );
          localStorage.setItem("mock_notifications", JSON.stringify(updated));
          fetchNotifications(user.uid);
        }
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },
    [user, fetchNotifications],
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user) return;
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          where("read", "==", false),
        );
        const snap = await getDocs(q);
        const promises = snap.docs.map((docSnap) =>
          updateDoc(doc(db, "notifications", docSnap.id), { read: true }),
        );
        await Promise.all(promises);
      } else {
        const local = localStorage.getItem("mock_notifications");
        const list = local ? JSON.parse(local) : [];
        const updated = list.map((n) =>
          n.userId === user.uid ? { ...n, read: true } : n,
        );
        localStorage.setItem("mock_notifications", JSON.stringify(updated));
        fetchNotifications(user.uid);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [user, fetchNotifications]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!user) return;
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          await deleteDoc(doc(db, "notifications", notificationId));
        } else {
          const local = localStorage.getItem("mock_notifications");
          const list = local ? JSON.parse(local) : [];
          const filtered = list.filter((n) => n.id !== notificationId);
          localStorage.setItem("mock_notifications", JSON.stringify(filtered));
          fetchNotifications(user.uid);
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [user, fetchNotifications],
  );

  const addAnnouncement = useCallback(
    async (baslik, icerik) => {
      const newAnn = {
        baslik,
        icerik,
        date: new Date().toISOString(),
        authorName: userProfile?.adSoyad || user?.email || "Yönetici",
        authorRole: userRole || "admin",
      };

      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          const docRef = await addDoc(collection(db, "announcements"), newAnn);
          return docRef.id;
        } else {
          const local = localStorage.getItem("mock_announcements");
          const list = local ? JSON.parse(local) : [];
          const annId = "mock-ann-" + Date.now();
          const annWithId = { id: annId, ...newAnn };
          list.push(annWithId);
          localStorage.setItem("mock_announcements", JSON.stringify(list));
          fetchAnnouncements();
          return annId;
        }
      } catch (err) {
        console.error("Error adding announcement:", err);
        throw err;
      }
    },
    [user, userProfile, userRole, fetchAnnouncements],
  );

  // Fetch group details: announcements, tasks
  const fetchGroupDetails = useCallback(async (groupId) => {
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        // Fetch group doc
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          setActiveGroup({ id: groupSnap.id, ...groupSnap.data() });
        }

        // Fetch announcements
        const annQ = query(
          collection(db, "group_announcements"),
          where("groupId", "==", groupId),
          orderBy("olusturmaTarihi", "desc"),
        );
        const annSnap = await getDocs(annQ);
        const annList = [];
        annSnap.forEach((d) => annList.push({ id: d.id, ...d.data() }));
        setGroupAnnouncements(annList);

        // Fetch tasks
        const taskQ = query(
          collection(db, "group_tasks"),
          where("groupId", "==", groupId),
          orderBy("olusturmaTarihi", "desc"),
        );
        const taskSnap = await getDocs(taskQ);
        const taskList = [];
        taskSnap.forEach((d) => taskList.push({ id: d.id, ...d.data() }));
        setGroupTasks(taskList);
      } else {
        // Mock group detail
        const localGroups = localStorage.getItem("mock_groups");
        const matchedGroup = localGroups
          ? JSON.parse(localGroups).find((g) => g.id === groupId)
          : null;
        if (matchedGroup) {
          setActiveGroup(matchedGroup);
        }

        const localAnn = localStorage.getItem("mock_group_announcements");
        const annList = localAnn
          ? JSON.parse(localAnn).filter((a) => a.groupId === groupId)
          : [];
        // Sort: Pinned first, then date desc
        annList.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi);
        });
        setGroupAnnouncements(annList);

        const localTasks = localStorage.getItem("mock_group_tasks");
        const taskList = localTasks
          ? JSON.parse(localTasks).filter((t) => t.groupId === groupId)
          : [];
        setGroupTasks(taskList);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  }, []);

  // Create Study Group
  const createStudyGroup = async (groupData) => {
    if (userRole === "student") {
      throw new Error("Öğrenciler çalışma grubu oluşturamaz.");
    }
    // Generate a 6-character alphanumeric invite code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGroup = {
      ad: groupData.ad,
      aciklama: groupData.aciklama || "",
      tema: groupData.tema || "",
      il: userProfile?.il || "",
      ilce: userProfile?.ilce || "",
      schoolId: userProfile?.schoolId || "",
      creatorId: user.uid,
      members: [user.uid],
      inviteCode: code,
      olusturmaTarihi: new Date().toISOString(),
    };

    let groupId;
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = await addDoc(collection(db, "groups"), newGroup);
      fetchGroups(user.uid, userRole, userProfile?.il, userProfile?.schoolId);
      groupId = docRef.id;
    } else {
      const mockId = "mock-group-" + Date.now();
      const local = localStorage.getItem("mock_groups");
      const list = local ? JSON.parse(local) : [];
      const updated = [{ id: mockId, ...newGroup }, ...list];
      localStorage.setItem("mock_groups", JSON.stringify(updated));
      fetchGroups(user.uid, userRole, userProfile?.il, userProfile?.schoolId);
      groupId = mockId;
    }

    if (user?.uid) {
      await awardBadgeToUser(user.uid, "Ekip Oyuncusu");
    }
    return groupId;
  };

  // Join Study Group with Invite Code
  const joinStudyGroupWithCode = async (code) => {
    if (!code) throw new Error("Davet kodu boş olamaz");
    const cleanCode = code.trim().toUpperCase();

    let groupId;
    if (!auth.config.apiKey.includes("DummyKey")) {
      const q = query(
        collection(db, "groups"),
        where("inviteCode", "==", cleanCode),
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error("Geçersiz davet kodu");
      }

      const groupDoc = snap.docs[0];
      const groupData = groupDoc.data();
      if (groupData.members?.includes(user.uid)) {
        throw new Error("Zaten bu gruba üyesiniz");
      }

      const updatedMembers = [...(groupData.members || []), user.uid];
      await updateDoc(doc(db, "groups", groupDoc.id), {
        members: updatedMembers,
      });
      fetchGroups(user.uid, userRole, userProfile?.il, userProfile?.schoolId);
      groupId = groupDoc.id;
    } else {
      const local = localStorage.getItem("mock_groups");
      const list = local ? JSON.parse(local) : [];
      const matchedIdx = list.findIndex((g) => g.inviteCode === cleanCode);
      if (matchedIdx === -1) {
        throw new Error("Geçersiz davet kodu");
      }
      if (list[matchedIdx].members?.includes(user.uid)) {
        throw new Error("Zaten bu gruba üyesiniz");
      }
      list[matchedIdx].members = [
        ...(list[matchedIdx].members || []),
        user.uid,
      ];
      localStorage.setItem("mock_groups", JSON.stringify(list));
      fetchGroups(user.uid, userRole, userProfile?.il, userProfile?.schoolId);
      groupId = list[matchedIdx].id;
    }

    if (user?.uid) {
      await awardBadgeToUser(user.uid, "Ekip Oyuncusu");
    }
    return groupId;
  };

  const joinStudyGroupById = async (groupId) => {
    if (!groupId) throw new Error("Grup ID boş olamaz");

    if (!auth.config.apiKey.includes("DummyKey")) {
      const groupRef = doc(db, "groups", groupId);
      const snap = await getDoc(groupRef);
      if (!snap.exists()) {
        throw new Error("Grup bulunamadı");
      }
      const groupData = snap.data();
      if (groupData.members?.includes(user.uid)) {
        throw new Error("Zaten bu gruba üyesiniz");
      }
      const updatedMembers = [...(groupData.members || []), user.uid];
      await updateDoc(groupRef, { members: updatedMembers });
      fetchGroups(user.uid, userRole, userProfile?.il, userProfile?.schoolId);
    } else {
      const local = localStorage.getItem("mock_groups");
      const list = local ? JSON.parse(local) : [];
      const matchedIdx = list.findIndex((g) => g.id === groupId);
      if (matchedIdx === -1) {
        throw new Error("Grup bulunamadı");
      }
      if (list[matchedIdx].members?.includes(user.uid)) {
        throw new Error("Zaten bu gruba üyesiniz");
      }
      list[matchedIdx].members = [
        ...(list[matchedIdx].members || []),
        user.uid,
      ];
      localStorage.setItem("mock_groups", JSON.stringify(list));
      fetchGroups(user.uid, userRole, userProfile?.il, userProfile?.schoolId);
    }

    if (user?.uid) {
      await awardBadgeToUser(user.uid, "Ekip Oyuncusu");
    }
    return groupId;
  };

  // Create Group Announcement
  const createGroupAnnouncement = useCallback(
    async (groupId, annData) => {
      const newAnn = {
        groupId,
        title: annData.title,
        content: annData.content,
        authorId: user.uid,
        authorName: userProfile?.adSoyad || "İsimsiz Kullanıcı",
        isPinned: false,
        olusturmaTarihi: new Date().toISOString(),
      };

      let resultId;
      if (!auth.config.apiKey.includes("DummyKey")) {
        const docRef = await addDoc(
          collection(db, "group_announcements"),
          newAnn,
        );
        fetchGroupDetails(groupId);
        resultId = docRef.id;
      } else {
        const mockId = "mock-ann-" + Date.now();
        const local = localStorage.getItem("mock_group_announcements");
        const list = local ? JSON.parse(local) : [];
        const updated = [{ id: mockId, ...newAnn }, ...list];
        localStorage.setItem(
          "mock_group_announcements",
          JSON.stringify(updated),
        );
        fetchGroupDetails(groupId);
        resultId = mockId;
      }

      const group = groups.find((g) => g.id === groupId);
      if (group && group.members) {
        group.members.forEach((memberId) => {
          if (memberId !== user.uid) {
            createNotification(
              memberId,
              "Yeni Grup Duyurusu",
              `"${group.name || group.ad || "Çalışma Grubu"}" grubunda yeni bir duyuru yayınlandı: "${annData.title}"`,
              "group",
              "groups",
            );
          }
        });
      }

      return resultId;
    },
    [user, userProfile, groups, createNotification, fetchGroupDetails],
  );

  // Delete Group Announcement
  const deleteGroupAnnouncement = async (announcementId, groupId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      await deleteDoc(doc(db, "group_announcements", announcementId));
    } else {
      const local = localStorage.getItem("mock_group_announcements");
      if (local) {
        const filtered = JSON.parse(local).filter(
          (a) => a.id !== announcementId,
        );
        localStorage.setItem(
          "mock_group_announcements",
          JSON.stringify(filtered),
        );
      }
    }
    fetchGroupDetails(groupId);
  };

  // Toggle Pinned Announcement
  const togglePinAnnouncement = async (announcementId, isPinned, groupId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      await updateDoc(doc(db, "group_announcements", announcementId), {
        isPinned,
      });
    } else {
      const local = localStorage.getItem("mock_group_announcements");
      if (local) {
        const updated = JSON.parse(local).map((a) =>
          a.id === announcementId ? { ...a, isPinned } : a,
        );
        localStorage.setItem(
          "mock_group_announcements",
          JSON.stringify(updated),
        );
      }
    }
    fetchGroupDetails(groupId);
  };

  // Create Group Task
  const createGroupTask = async (groupId, taskData) => {
    const newTask = {
      groupId,
      title: taskData.title,
      description: taskData.description || "",
      status: "todo",
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate || "",
      assignedTo: taskData.assignedTo || [],
      xpReward: taskData.xpReward || 50,
      olusturmaTarihi: new Date().toISOString(),
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = await addDoc(collection(db, "group_tasks"), newTask);
      fetchGroupDetails(groupId);
      return docRef.id;
    } else {
      const mockId = "mock-task-" + Date.now();
      const local = localStorage.getItem("mock_group_tasks");
      const list = local ? JSON.parse(local) : [];
      const updated = [{ id: mockId, ...newTask }, ...list];
      localStorage.setItem("mock_group_tasks", JSON.stringify(updated));
      fetchGroupDetails(groupId);
      return mockId;
    }
  };

  // Update Group Task Status (Trigger XP reward if done)
  const updateGroupTaskStatus = async (taskId, newStatus, groupId) => {
    try {
      let taskData = null;
      let oldStatus = "";

      if (!auth.config.apiKey.includes("DummyKey")) {
        const taskRef = doc(db, "group_tasks", taskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          taskData = taskSnap.data();
          oldStatus = taskData.status;
          await updateDoc(taskRef, { status: newStatus });
        }
      } else {
        const local = localStorage.getItem("mock_group_tasks");
        if (local) {
          const list = JSON.parse(local);
          const idx = list.findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            taskData = list[idx];
            oldStatus = taskData.status;
            list[idx].status = newStatus;
            localStorage.setItem("mock_group_tasks", JSON.stringify(list));
          }
        }
      }

      // Trigger XP award if changed from something else to 'done'
      if (taskData && newStatus === "done" && oldStatus !== "done") {
        const xp = Number(taskData.xpReward) || 50;
        const assignees = taskData.assignedTo || [];

        for (const userUid of assignees) {
          await awardXpToUser(userUid, xp);
          await awardBadgeToUser(userUid, "Görev Canavarı");
        }
      }

      fetchGroupDetails(groupId);
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Assign task to members
  const assignTaskToMembers = async (taskId, memberUids, groupId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      await updateDoc(doc(db, "group_tasks", taskId), {
        assignedTo: memberUids,
      });
    } else {
      const local = localStorage.getItem("mock_group_tasks");
      if (local) {
        const list = JSON.parse(local);
        const idx = list.findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          list[idx].assignedTo = memberUids;
          localStorage.setItem("mock_group_tasks", JSON.stringify(list));
        }
      }
    }
    fetchGroupDetails(groupId);
  };

  // Fetch approved or all data
  const fetchData = useCallback(async (isMod = false) => {
    setLoading(true);
    try {
      let eventsList = [];
      let projectsList = [];

      // If firebase is configured and online, attempt fetching
      if (!auth.config.apiKey.includes("DummyKey")) {
        const eventsRef = collection(db, "events");
        const projectsRef = collection(db, "projects");

        let eventsQuery, projectsQuery;

        if (isMod) {
          // Moderators see everything ordered by creation date
          eventsQuery = query(eventsRef, orderBy("olusturmaTarihi", "desc"));
          projectsQuery = query(
            projectsRef,
            orderBy("olusturmaTarihi", "desc"),
          );
        } else {
          // Regular users only see approved entries
          eventsQuery = query(eventsRef, where("onaylandi", "==", true));
          projectsQuery = query(projectsRef, where("onaylandi", "==", true));
        }

        // 3-second timeout for Firestore fetch to prevent page load hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firestore fetch timeout")), 3000),
        );

        const [eventsSnap, projectsSnap] = await Promise.race([
          Promise.all([getDocs(eventsQuery), getDocs(projectsQuery)]),
          timeoutPromise,
        ]);

        eventsSnap.forEach((doc) => {
          eventsList.push({ id: doc.id, ...doc.data() });
        });

        projectsSnap.forEach((doc) => {
          projectsList.push({ id: doc.id, ...doc.data() });
        });

        // Fallback to mock data if connection was successful but Firestore is empty
        if (eventsList.length === 0 && projectsList.length === 0) {
          throw new Error("Firestore database is empty");
        }
      } else {
        throw new Error(
          "Firebase initialized with dummy config, using mock data.",
        );
      }

      setEvents(eventsList);
      setProjects(projectsList);
      setIsUsingMockData(false);
    } catch (error) {
      console.warn(
        "Firebase fetch failed or empty, falling back to mock data:",
        error.message,
      );
      setIsUsingMockData(true);
      // Populate with mock data for display
      const seededEventsWithIds = seedEvents.map((event, idx) => ({
        id: `seed-event-${idx}`,
        ...event,
      }));
      const seededProjectsWithIds = seedProjects.map((project, idx) => {
        const matchedEvent = seededEventsWithIds.find(
          (e) => e.ad === project.etkinlikAd,
        );
        const projectToSave = { ...project };
        delete projectToSave.etkinlikAd;
        return {
          id: `seed-project-${idx}`,
          etkinlikId: matchedEvent ? matchedEvent.id : "",
          ...projectToSave,
        };
      });

      if (isMod) {
        setEvents([
          ...seededEventsWithIds,
          {
            id: "unapproved-event-1",
            ad: "Trabzon Robot Futbol Ligi Hazırlık Kampı",
            tema: "robot-futbol-ligi",
            format: "Yüz Yüze",
            il: "Trabzon",
            ilce: "Ortahisar",
            kapsam: "ilce",
            tarih: "2026-08-10",
            katilimciSayisi: 80,
            aciklama:
              "Otonom robot futbol ligine katılacak takımlar için teknik hazırlık kampı.",
            onaylandi: false,
            oneCikar: false,
            olusturmaTarihi: new Date().toISOString(),
            durum: "duyuru",
            ogrenciSiniri: 40,
            basvuruKisitlama: { ilKisitlama: true, ilceKisitlama: false },
          },
        ]);
        setProjects([
          ...seededProjectsWithIds,
          {
            id: "unapproved-project-1",
            ad: "ROS Tabanlı Otonom Kaleci",
            etkinlikId: "unapproved-event-1",
            tema: "robot-futbol-ligi",
            parkur: "Robotik",
            takimAdi: "Karadeniz Fırtınası",
            katilimciIller: ["Trabzon", "Rize"],
            aciklama:
              "Derin öğrenme ile top takibi yapabilen otonom robot kaleci yazılımı.",
            githubLink: "https://github.com/genctek-atlas/ros-goalkeeper",
            etikKontrol: true,
            onaylandi: false,
            oneCikar: false,
            olusturmaTarihi: new Date().toISOString(),
          },
        ]);
      } else {
        setEvents(seededEventsWithIds);
        setProjects(seededProjectsWithIds);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const seedMockUsersIfEmpty = useCallback(() => {
    const localUsers = localStorage.getItem("mock_users");
    if (!localUsers || JSON.parse(localUsers).length < 2) {
      const defaultUsers = [
        {
          uid: "mock-admin-uid",
          adSoyad: "Sistem Yöneticisi",
          eposta: "admin@genctek.org",
          role: "admin",
          xp: 9999,
          badges: ["admin-badge"],
          olusturmaTarihi: new Date().toISOString(),
        },
        {
          uid: "mock-coord-konya",
          adSoyad: "Ahmet Yılmaz",
          eposta: "coordinator@genctek.org",
          role: "coordinator",
          il: "Konya",
          ilce: "Meram",
          schoolId: "",
          xp: 120,
          badges: ["coord-badge"],
          olusturmaTarihi: new Date().toISOString(),
        },
        {
          uid: "mock-commission-konya",
          adSoyad: "Fatma Çelik",
          eposta: "commission@genctek.org",
          role: "commission",
          il: "Konya",
          ilce: "",
          schoolId: "",
          xp: 80,
          badges: ["commission-badge"],
          olusturmaTarihi: new Date().toISOString(),
        },
        {
          uid: "mock-teacher-konya",
          adSoyad: "Mehmet Demir",
          eposta: "teacher@genctek.org",
          role: "teacher",
          il: "Konya",
          ilce: "Selçuklu",
          schoolId: "static-42-selçuklu-0",
          xp: 350,
          badges: ["teacher-badge"],
          olusturmaTarihi: new Date().toISOString(),
        },
        {
          uid: "mock-student-konya",
          adSoyad: "Ali Kaya",
          eposta: "student@genctek.org",
          role: "student",
          il: "Konya",
          ilce: "Selçuklu",
          schoolId: "static-42-selçuklu-0",
          xp: 50,
          badges: ["beginner"],
          olusturmaTarihi: new Date().toISOString(),
          studentProfile: {
            sinif: "10. Sınıf",
            teacherId: "mock-teacher-konya",
            isStudentRep: false,
          },
        },
      ];
      localStorage.setItem("mock_users", JSON.stringify(defaultUsers));

      localStorage.setItem(
        "mock_coordinator_profiles",
        JSON.stringify([
          {
            id: "mock-coord-konya",
            adSoyad: "Ahmet Yılmaz",
            eposta: "coordinator@genctek.org",
            il: "Konya",
            telefon: "5551112233",
          },
        ]),
      );

      localStorage.setItem(
        "mock_teacher_profile",
        JSON.stringify({
          uid: "mock-teacher-konya",
          adSoyad: "Mehmet Demir",
          eposta: "teacher@genctek.org",
          il: "Konya",
          ilce: "Selçuklu",
          okul: "static-42-selçuklu-0",
          rol: "teacher",
        }),
      );

      const defaultMessages = [
        {
          id: "msg-init-1",
          senderId: "mock-coord-konya",
          senderName: "Ahmet Yılmaz",
          senderRole: "coordinator",
          receiverId: "mock-student-konya",
          receiverName: "Ali Kaya",
          receiverRole: "student",
          il: "Konya",
          mesaj:
            "Merhaba Ali, GençTek Atlas platformuna hoş geldin! İl koordinatörün olarak her türlü sorun ve projelerin için bana buradan ulaşabilirsin.",
          tarih: new Date(Date.now() - 3600000 * 2).toISOString(),
          okundu: true,
        },
        {
          id: "msg-init-2",
          senderId: "mock-student-konya",
          senderName: "Ali Kaya",
          senderRole: "student",
          receiverId: "mock-coord-konya",
          receiverName: "Ahmet Yılmaz",
          receiverRole: "coordinator",
          il: "Konya",
          mesaj:
            "Teşekkür ederim koordinatörüm, siber güvenlik kulübü kurmak istiyorduk, bununla ilgili size danışacaktım.",
          tarih: new Date(Date.now() - 3600000).toISOString(),
          okundu: true,
        },
      ];
      localStorage.setItem(
        "mock_direct_messages",
        JSON.stringify(defaultMessages),
      );
    }
  }, []);

  // Check auth state and load profile/roles
  useEffect(() => {
    seedMockUsersIfEmpty();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.email === "admin@genctek.org") {
          setUserRole("admin");
          setUserProfile({
            uid: currentUser.uid,
            adSoyad: "Sistem Yöneticisi",
            eposta: currentUser.email,
            role: "admin",
            xp: 9999,
            badges: ["admin-badge"],
          });
          fetchData(true);
          fetchApplications(true);
          fetchGroups(currentUser.uid, "admin");
        } else {
          let role = "teacher";
          let city = "";
          let profile = null;

          if (!auth.config.apiKey.includes("DummyKey")) {
            // 1. Try unified users collection
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              profile = userSnap.data();
              role = profile.role || "teacher";
              city = profile.il || "";
            } else {
              // 2. Legacy Migration: Try teachers collection
              const teacherRef = doc(db, "teachers", currentUser.uid);
              const teacherSnap = await getDoc(teacherRef);
              if (teacherSnap.exists()) {
                const teacherData = teacherSnap.data();
                profile = {
                  uid: currentUser.uid,
                  adSoyad: teacherData.adSoyad,
                  eposta: teacherData.eposta,
                  telefon: teacherData.telefon || "",
                  role: teacherData.rol || "teacher",
                  il: teacherData.il || "",
                  ilce: teacherData.ilce || teacherData.ilçe || "",
                  schoolId: teacherData.okul || "",
                  xp: 0,
                  badges: [],
                  olusturmaTarihi:
                    teacherData.olusturmaTarihi || new Date().toISOString(),
                };
                await setDoc(userRef, profile);
                role = profile.role;
                city = profile.il;
              } else {
                // Try students collection migration
                const studentRef = doc(db, "students", currentUser.uid);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                  const studentData = studentSnap.data();
                  profile = {
                    uid: currentUser.uid,
                    adSoyad: studentData.adSoyad,
                    eposta: currentUser.email,
                    role: "student",
                    il: studentData.il || "",
                    ilce: studentData.ilce || "",
                    schoolId: studentData.okul || "",
                    xp: studentData.xp || 0,
                    badges: studentData.badges || [],
                    olusturmaTarihi:
                      studentData.olusturmaTarihi || new Date().toISOString(),
                    studentProfile: {
                      sinif: studentData.sinifSeviyesi || "",
                      teacherId: studentData.ogretmenId || "",
                      isStudentRep: studentData.isStudentRep || false,
                    },
                  };
                  await setDoc(userRef, profile);
                  role = "student";
                  city = profile.il;
                }
              }
            }
          } else {
            // Mock users migration & fetch
            const localUsers = localStorage.getItem("mock_users");
            let parsedUsers = localUsers ? JSON.parse(localUsers) : [];
            let matched = parsedUsers.find((u) => u.uid === currentUser.uid);

            if (matched) {
              profile = matched;
              role = matched.role;
              city = matched.il || "";
            } else {
              // Try legacy mock teacher migration
              const savedProfile = localStorage.getItem("mock_teacher_profile");
              if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                if (parsed.uid === currentUser.uid) {
                  profile = {
                    uid: currentUser.uid,
                    adSoyad: parsed.adSoyad,
                    eposta: parsed.eposta,
                    telefon: parsed.telefon || "",
                    role: parsed.rol || "teacher",
                    il: parsed.il || "",
                    ilce: parsed.ilce || parsed.ilçe || "",
                    schoolId: parsed.okul || "",
                    xp: 0,
                    badges: [],
                    olusturmaTarihi:
                      parsed.olusturmaTarihi || new Date().toISOString(),
                  };
                  parsedUsers.push(profile);
                  localStorage.setItem(
                    "mock_users",
                    JSON.stringify(parsedUsers),
                  );
                  role = profile.role;
                  city = profile.il;
                }
              }
              if (!profile) {
                // Try legacy coordinator migration
                const coordProfiles = localStorage.getItem(
                  "mock_coordinator_profiles",
                );
                if (coordProfiles) {
                  const matchedCoord = JSON.parse(coordProfiles).find(
                    (c) =>
                      c.id === currentUser.uid ||
                      c.eposta === currentUser.email,
                  );
                  if (matchedCoord) {
                    profile = {
                      uid: matchedCoord.id || currentUser.uid,
                      adSoyad: matchedCoord.adSoyad,
                      eposta: matchedCoord.eposta,
                      telefon: matchedCoord.telefon || "",
                      role: "coordinator",
                      il: matchedCoord.il || "",
                      ilce: matchedCoord.ilce || "",
                      schoolId: "",
                      xp: 0,
                      badges: [],
                      olusturmaTarihi:
                        matchedCoord.olusturmaTarihi ||
                        new Date().toISOString(),
                    };
                    parsedUsers.push(profile);
                    localStorage.setItem(
                      "mock_users",
                      JSON.stringify(parsedUsers),
                    );
                    role = "coordinator";
                    city = profile.il;
                  }
                }
              }
            }
          }

          setUserRole(role);
          setUserProfile(profile);
          setTeacherProfile(profile); // Maintain for backward compatibility

          if (role === "coordinator" || role === "commission") {
            fetchData(true);
            fetchApplications(
              false,
              currentUser.uid,
              role === "coordinator",
              city,
              role === "commission",
            );
          } else if (role === "teacher" || role === "principal") {
            fetchStudents(currentUser.uid);
            fetchData(false);
            fetchApplications(false, currentUser.uid, false);
          } else if (role === "student") {
            fetchData(false);
            fetchApplications(
              false,
              profile.studentProfile?.teacherId || null,
              false,
            );
          }

          const schoolId = profile?.schoolId || profile?.okul || "";
          fetchGroups(currentUser.uid, role, city, schoolId);
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
        setTeacherProfile(null);
        setStudents([]);
        setApplications([]);
        setGroups([]);
        setActiveGroup(null);
        setGroupAnnouncements([]);
        setGroupTasks([]);
        fetchData(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Secondary auth helper to register a user without signing out the current user
  const createSecondaryAuthUser = async (email, password) => {
    const apps = getApps();
    const secondaryApp = apps.find((app) => app.name === "secondaryApp");
    if (secondaryApp) {
      await deleteApp(secondaryApp);
    }

    const newApp = initializeApp(firebaseConfig, "secondaryApp");
    const secondaryAuth = getSecondaryAuth(newApp);
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    const uid = userCredential.user.uid;

    await secondaryAuth.signOut();
    await deleteApp(newApp);

    return uid;
  };

  // General User Registration (Supports Teacher and Principal)
  const registerUser = async (
    email,
    password,
    profileData,
    role = "teacher",
  ) => {
    if (role === "coordinator" || role === "commission" || role === "admin") {
      throw new Error(
        "Bu yetkideki kullanıcılar genel kayıt formu üzerinden oluşturulamaz. Sadece moderatörler tarafından eklenebilir.",
      );
    }
    const newProfile = {
      uid: "",
      adSoyad: profileData.adSoyad,
      eposta: email,
      telefon: profileData.telefon || "",
      role: role,
      il: profileData.il || "",
      ilce: profileData.ilce || "",
      schoolId: profileData.okul || "",
      xp: 0,
      badges: [],
      onaylandi: false,
      olusturmaTarihi: new Date().toISOString(),
      ...(role === "principal" && {
        principalProfile: {
          studentRepInfo: profileData.studentRepInfo || null,
        },
      }),
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;
      newProfile.uid = uid;

      // Write to unified users
      await setDoc(doc(db, "users", uid), newProfile);

      // Legacy compatibility write to teachers collection if role is teacher/principal
      if (role === "teacher" || role === "principal") {
        await setDoc(doc(db, "teachers", uid), {
          uid,
          adSoyad: profileData.adSoyad,
          eposta: email,
          telefon: profileData.telefon,
          il: profileData.il,
          ilce: profileData.ilce,
          okul: profileData.okul,
          rol: role,
          olusturmaTarihi: newProfile.olusturmaTarihi,
        });
      }
      return uid;
    } else {
      // Mock register flow
      const mockUid = `mock-user-${role}-` + Date.now();
      newProfile.uid = mockUid;

      const localUsers = localStorage.getItem("mock_users");
      const currentUsers = localUsers ? JSON.parse(localUsers) : [];
      const updatedUsers = [newProfile, ...currentUsers];
      localStorage.setItem("mock_users", JSON.stringify(updatedUsers));

      if (role === "teacher" || role === "principal") {
        localStorage.setItem(
          "mock_teacher_profile",
          JSON.stringify({
            uid: mockUid,
            adSoyad: profileData.adSoyad,
            eposta: email,
            telefon: profileData.telefon,
            il: profileData.il,
            ilce: profileData.ilce,
            okul: profileData.okul,
            rol: role,
            olusturmaTarihi: newProfile.olusturmaTarihi,
          }),
        );
      }

      setUser({ email, uid: mockUid });
      setUserRole(role);
      setUserProfile(newProfile);
      setTeacherProfile(newProfile);
      return mockUid;
    }
  };

  // Deprecated helper redirected to registerUser
  const registerTeacher = async (email, password, profileData) => {
    return registerUser(email, password, profileData, "teacher");
  };

  // Student Registration Flow
  const registerStudent = async (email, password, studentData) => {
    const newProfile = {
      uid: "",
      adSoyad: studentData.adSoyad,
      eposta: email,
      telefon: studentData.veliTelefon || "",
      role: "student",
      il: studentData.il || teacherProfile?.il || "",
      ilce:
        studentData.ilce || teacherProfile?.ilce || teacherProfile?.ilçe || "",
      schoolId:
        studentData.schoolId ||
        teacherProfile?.schoolId ||
        teacherProfile?.okul ||
        "",
      xp: 0,
      badges: [],
      onaylandi: false,
      olusturmaTarihi: new Date().toISOString(),
      studentProfile: {
        sinif: studentData.sinifSeviyesi || "",
        teacherId: studentData.teacherId || user?.uid || "",
        isStudentRep: studentData.isStudentRep || false,
      },
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const uid = await createSecondaryAuthUser(email, password);
      newProfile.uid = uid;

      // Write to new unified users collection
      await setDoc(doc(db, "users", uid), newProfile);

      // Write to legacy students collection for compatibility
      const legacyDoc = await addDoc(collection(db, "students"), {
        ogretmenId: studentData.teacherId || user?.uid || "",
        adSoyad: studentData.adSoyad,
        sinifSeviyesi: studentData.sinifSeviyesi,
        veliTelefon: studentData.veliTelefon,
        isStudentRep: studentData.isStudentRep || false,
        olusturmaTarihi: newProfile.olusturmaTarihi,
        studentUid: uid,
      });

      if (user?.uid) {
        fetchStudents(user.uid);
      }
      return legacyDoc.id;
    } else {
      // Mock flow
      const mockUid = "mock-student-auth-" + Date.now();
      newProfile.uid = mockUid;

      const localUsers = localStorage.getItem("mock_users");
      const currentUsers = localUsers ? JSON.parse(localUsers) : [];
      const updatedUsers = [newProfile, ...currentUsers];
      localStorage.setItem("mock_users", JSON.stringify(updatedUsers));

      const mockStudentId = "mock-student-legacy-" + Date.now();
      const newMockStudentLegacy = {
        id: mockStudentId,
        ogretmenId: studentData.teacherId || user?.uid || "",
        adSoyad: studentData.adSoyad,
        sinifSeviyesi: studentData.sinifSeviyesi,
        veliTelefon: studentData.veliTelefon,
        isStudentRep: studentData.isStudentRep || false,
        olusturmaTarihi: newProfile.olusturmaTarihi,
        studentUid: mockUid,
      };

      const localStudents = localStorage.getItem("mock_students");
      const currentStudents = localStudents ? JSON.parse(localStudents) : [];
      const updatedStudents = [newMockStudentLegacy, ...currentStudents];
      localStorage.setItem("mock_students", JSON.stringify(updatedStudents));

      setStudents(updatedStudents);
      return mockStudentId;
    }
  };

  // Student CRUD Operations (Maintained for legacy view support)
  const addStudent = async (studentData) => {
    // Generate a default email/password for legacy student flow
    const email = `student-${Date.now()}@genctek.org`;
    const password = "student123";
    return registerStudent(email, password, studentData);
  };

  const updateStudent = async (studentId, studentData) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, "students", studentId);
      await updateDoc(docRef, studentData);

      // Update in unified users if studentUid is known
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().studentUid) {
        const userRef = doc(db, "users", docSnap.data().studentUid);
        await updateDoc(userRef, {
          adSoyad: studentData.adSoyad,
          telefon: studentData.veliTelefon,
          "studentProfile.sinif": studentData.sinifSeviyesi,
        });
      }
      fetchStudents(user.uid);
    } else {
      const updatedList = students.map((s) =>
        s.id === studentId ? { ...s, ...studentData } : s,
      );
      setStudents(updatedList);
      localStorage.setItem("mock_students", JSON.stringify(updatedList));

      // Update mock users as well
      const matched = updatedList.find((s) => s.id === studentId);
      if (matched && matched.studentUid) {
        const localUsers = localStorage.getItem("mock_users");
        if (localUsers) {
          const parsedUsers = JSON.parse(localUsers);
          const idx = parsedUsers.findIndex(
            (u) => u.uid === matched.studentUid,
          );
          if (idx !== -1) {
            parsedUsers[idx].adSoyad = studentData.adSoyad;
            parsedUsers[idx].telefon = studentData.veliTelefon;
            if (parsedUsers[idx].studentProfile) {
              parsedUsers[idx].studentProfile.sinif = studentData.sinifSeviyesi;
            }
            localStorage.setItem("mock_users", JSON.stringify(parsedUsers));
          }
        }
      }
    }
  };

  const deleteStudent = async (studentId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, "students", studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().studentUid) {
        // Delete unified user profile
        const userRef = doc(db, "users", docSnap.data().studentUid);
        await deleteDoc(userRef);
      }
      await deleteDoc(docRef);
      fetchStudents(user.uid);
    } else {
      const matched = students.find((s) => s.id === studentId);
      const updatedList = students.filter((s) => s.id !== studentId);
      setStudents(updatedList);
      localStorage.setItem("mock_students", JSON.stringify(updatedList));

      if (matched && matched.studentUid) {
        const localUsers = localStorage.getItem("mock_users");
        if (localUsers) {
          const parsedUsers = JSON.parse(localUsers).filter(
            (u) => u.uid !== matched.studentUid,
          );
          localStorage.setItem("mock_users", JSON.stringify(parsedUsers));
        }
      }
    }
  };

  // Toggle Student Rep Status
  const toggleStudentRepStatus = async (studentId, isRep) => {
    let studentInfo = null;
    let foundStudentUid = null;

    if (!auth.config.apiKey.includes("DummyKey")) {
      // 1. Check legacy students collection first
      const studentDocRef = doc(db, "students", studentId);
      const studentSnap = await getDoc(studentDocRef);

      if (studentSnap.exists()) {
        foundStudentUid = studentSnap.data().studentUid;
        await updateDoc(studentDocRef, { isStudentRep: isRep });
      } else {
        // studentId might actually be the studentUid (unified user uid)
        foundStudentUid = studentId;
        // Search legacy students for this studentUid to keep them sync'd
        const q = query(
          collection(db, "students"),
          where("studentUid", "==", studentId),
        );
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const lId = qSnap.docs[0].id;
          await updateDoc(doc(db, "students", lId), { isStudentRep: isRep });
        }
      }

      if (foundStudentUid) {
        const userDocRef = doc(db, "users", foundStudentUid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          await updateDoc(userDocRef, {
            "studentProfile.isStudentRep": isRep,
            isStudentRep: isRep,
          });
          studentInfo = userSnap.data();
        }
      }

      // Update principal profile if logged in user is principal
      if (userRole === "principal" && user) {
        const principalDocRef = doc(db, "users", user.uid);
        const repInfo =
          isRep && studentInfo
            ? {
                adSoyad: studentInfo.adSoyad || "",
                eposta: studentInfo.eposta || "",
                telefon: studentInfo.telefon || studentInfo.veliTelefon || "",
              }
            : null;

        await updateDoc(principalDocRef, {
          studentRepInfo: repInfo,
        });

        // Legacy teachers table update if exists
        const teacherDocRef = doc(db, "teachers", user.uid);
        const teacherSnap = await getDoc(teacherDocRef);
        if (teacherSnap.exists()) {
          await updateDoc(teacherDocRef, {
            studentRepInfo: repInfo,
          });
        }

        // Update local userProfile state
        setUserProfile((prev) =>
          prev ? { ...prev, studentRepInfo: repInfo } : null,
        );
      }

      if (user?.uid) {
        fetchStudents(user.uid);
      }
    } else {
      // Mock mode
      const localStudents = localStorage.getItem("mock_students");
      const localUsers = localStorage.getItem("mock_users");
      let parsedStudents = localStudents ? JSON.parse(localStudents) : [];
      let parsedUsers = localUsers ? JSON.parse(localUsers) : [];

      // 1. Try to find student in mock_students
      let matchedStudent = parsedStudents.find((s) => s.id === studentId);
      let foundLegacy = false;
      if (matchedStudent) {
        foundStudentUid = matchedStudent.studentUid;
        matchedStudent.isStudentRep = isRep;
        foundLegacy = true;
      } else {
        // studentId might be studentUid
        foundStudentUid = studentId;
        matchedStudent = parsedStudents.find((s) => s.studentUid === studentId);
        if (matchedStudent) {
          matchedStudent.isStudentRep = isRep;
          foundLegacy = true;
        }
      }

      if (foundLegacy) {
        localStorage.setItem("mock_students", JSON.stringify(parsedStudents));
        setStudents(parsedStudents);
      }

      // 2. Find and update in mock_users
      if (foundStudentUid) {
        const userMatched = parsedUsers.find((u) => u.uid === foundStudentUid);
        if (userMatched) {
          if (userMatched.studentProfile) {
            userMatched.studentProfile.isStudentRep = isRep;
          }
          userMatched.isStudentRep = isRep;
          studentInfo = userMatched;
        }
      }

      // 3. Update principal profile if principal is logged in
      if (userRole === "principal" && user) {
        const repInfo =
          isRep && studentInfo
            ? {
                adSoyad: studentInfo.adSoyad || "",
                eposta: studentInfo.eposta || "",
                telefon: studentInfo.telefon || studentInfo.veliTelefon || "",
              }
            : null;

        const pIdx = parsedUsers.findIndex((u) => u.uid === user.uid);
        if (pIdx !== -1) {
          parsedUsers[pIdx].studentRepInfo = repInfo;
          setUserProfile(parsedUsers[pIdx]);
        }
      }

      localStorage.setItem("mock_users", JSON.stringify(parsedUsers));
    }
  };

  // Update User Profile Data (called by UserProfileModal)
  const updateUserProfileData = async (uid, updatedData) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, updatedData);

      if (userRole === "teacher" || userRole === "principal") {
        const teacherRef = doc(db, "teachers", uid);
        const teacherSnap = await getDoc(teacherRef);
        if (teacherSnap.exists()) {
          await updateDoc(teacherRef, {
            adSoyad: updatedData.adSoyad || teacherSnap.data().adSoyad,
            telefon: updatedData.telefon || teacherSnap.data().telefon,
            il: updatedData.il || teacherSnap.data().il,
            ilce: updatedData.ilce || teacherSnap.data().ilce,
            okul: updatedData.schoolId || teacherSnap.data().okul,
          });
        }
      }

      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
        setTeacherProfile(userSnap.data());
      }
    } else {
      const localUsers = localStorage.getItem("mock_users");
      if (localUsers) {
        const parsed = JSON.parse(localUsers);
        const idx = parsed.findIndex((u) => u.uid === uid);
        if (idx !== -1) {
          parsed[idx] = { ...parsed[idx], ...updatedData };
          localStorage.setItem("mock_users", JSON.stringify(parsed));
          setUserProfile(parsed[idx]);
          setTeacherProfile(parsed[idx]);

          if (
            parsed[idx].role === "teacher" ||
            parsed[idx].role === "principal"
          ) {
            localStorage.setItem(
              "mock_teacher_profile",
              JSON.stringify({
                uid: parsed[idx].uid,
                adSoyad: parsed[idx].adSoyad,
                eposta: parsed[idx].eposta,
                telefon: parsed[idx].telefon,
                il: parsed[idx].il,
                ilce: parsed[idx].ilce,
                okul: parsed[idx].schoolId,
                rol: parsed[idx].role,
                olusturmaTarihi: parsed[idx].olusturmaTarihi,
              }),
            );
          }
        }
      }
    }

    await awardBadgeToUser(uid, "Kaşif");
  };

  // Update User Role (called in moderation screen)
  const updateUserRole = async (targetUid, newRole) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, { role: newRole });

      const teacherRef = doc(db, "teachers", targetUid);
      const teacherSnap = await getDoc(teacherRef);
      if (teacherSnap.exists()) {
        await updateDoc(teacherRef, { rol: newRole });
      }
    } else {
      const localUsers = localStorage.getItem("mock_users");
      if (localUsers) {
        const parsed = JSON.parse(localUsers);
        const idx = parsed.findIndex((u) => u.uid === targetUid);
        if (idx !== -1) {
          parsed[idx].role = newRole;
          localStorage.setItem("mock_users", JSON.stringify(parsed));
        }
      }

      const coordProfiles = localStorage.getItem("mock_coordinator_profiles");
      if (coordProfiles && newRole === "coordinator") {
        const parsedCoords = JSON.parse(coordProfiles);
        const exist = parsedCoords.some((c) => c.id === targetUid);
        if (!exist) {
          const localUsersList = localStorage.getItem("mock_users");
          const userMatched = localUsersList
            ? JSON.parse(localUsersList).find((u) => u.uid === targetUid)
            : null;
          if (userMatched) {
            parsedCoords.push({
              id: targetUid,
              adSoyad: userMatched.adSoyad,
              eposta: userMatched.eposta,
              telefon: userMatched.telefon,
              il: userMatched.il,
              olusturmaTarihi: new Date().toISOString(),
            });
            localStorage.setItem(
              "mock_coordinator_profiles",
              JSON.stringify(parsedCoords),
            );
          }
        }
      }
    }
    refreshData();
  };

  // Update Coordinator or Commission Member profile details
  const updateModeratorOrCommission = async (uid, role, updatedData) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        adSoyad: updatedData.adSoyad,
        eposta: updatedData.eposta,
        telefon: updatedData.telefon || "",
        il: updatedData.il,
        role: updatedData.role || role,
      });

      if (role === "coordinator" || updatedData.role === "coordinator") {
        const teacherRef = doc(db, "teachers", uid);
        const teacherSnap = await getDoc(teacherRef);
        if (teacherSnap.exists()) {
          await updateDoc(teacherRef, {
            adSoyad: updatedData.adSoyad,
            eposta: updatedData.eposta,
            telefon: updatedData.telefon || "",
            il: updatedData.il,
            rol: updatedData.role || role,
          });
        } else {
          await setDoc(teacherRef, {
            uid: uid,
            adSoyad: updatedData.adSoyad,
            eposta: updatedData.eposta,
            telefon: updatedData.telefon || "",
            il: updatedData.il,
            rol: updatedData.role || role,
            olusturmaTarihi: new Date().toISOString(),
          });
        }
      }
    } else {
      const localUsers = localStorage.getItem("mock_users");
      if (localUsers) {
        const parsed = JSON.parse(localUsers);
        const idx = parsed.findIndex((u) => u.uid === uid);
        if (idx !== -1) {
          parsed[idx] = {
            ...parsed[idx],
            adSoyad: updatedData.adSoyad,
            eposta: updatedData.eposta,
            telefon: updatedData.telefon || "",
            il: updatedData.il,
            role: updatedData.role || role,
          };
          localStorage.setItem("mock_users", JSON.stringify(parsed));
        }
      }

      if (role === "coordinator" || updatedData.role === "coordinator") {
        const localCoords = localStorage.getItem("mock_coordinator_profiles");
        let parsedCoords = localCoords ? JSON.parse(localCoords) : [];
        const idx = parsedCoords.findIndex(
          (c) => c.id === uid || c.uid === uid,
        );
        if (idx !== -1) {
          parsedCoords[idx] = {
            ...parsedCoords[idx],
            adSoyad: updatedData.adSoyad,
            eposta: updatedData.eposta,
            telefon: updatedData.telefon || "",
            il: updatedData.il,
            role: updatedData.role || role,
          };
          localStorage.setItem(
            "mock_coordinator_profiles",
            JSON.stringify(parsedCoords),
          );
        } else if (updatedData.role === "coordinator") {
          parsedCoords.push({
            id: uid,
            uid: uid,
            adSoyad: updatedData.adSoyad,
            eposta: updatedData.eposta,
            telefon: updatedData.telefon || "",
            il: updatedData.il,
            role: "coordinator",
            olusturmaTarihi: new Date().toISOString(),
          });
          localStorage.setItem(
            "mock_coordinator_profiles",
            JSON.stringify(parsedCoords),
          );
        }
      }

      if (role === "coordinator" && updatedData.role === "commission") {
        const localCoords = localStorage.getItem("mock_coordinator_profiles");
        if (localCoords) {
          const parsedCoords = JSON.parse(localCoords);
          const filteredCoords = parsedCoords.filter(
            (c) => c.id !== uid && c.uid !== uid,
          );
          localStorage.setItem(
            "mock_coordinator_profiles",
            JSON.stringify(filteredCoords),
          );
        }
      }
    }
    refreshData();
  };

  // Delete Coordinator or Commission Member profile
  const deleteModeratorOrCommission = async (uid, role) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      await deleteDoc(doc(db, "users", uid));
      if (role === "coordinator") {
        await deleteDoc(doc(db, "teachers", uid));
      }
    } else {
      const localUsers = localStorage.getItem("mock_users");
      if (localUsers) {
        const parsed = JSON.parse(localUsers);
        const filtered = parsed.filter((u) => u.uid !== uid);
        localStorage.setItem("mock_users", JSON.stringify(filtered));
      }

      if (role === "coordinator") {
        const localCoords = localStorage.getItem("mock_coordinator_profiles");
        if (localCoords) {
          const parsed = JSON.parse(localCoords);
          const filtered = parsed.filter((c) => c.id !== uid && c.uid !== uid);
          localStorage.setItem(
            "mock_coordinator_profiles",
            JSON.stringify(filtered),
          );
        }
      }
    }
    refreshData();
  };

  // Add Event Application
  const addEventApplication = async (applicationData) => {
    const newApp = {
      ...applicationData,
      onaylandi: false,
      olusturmaTarihi: new Date().toISOString(),
    };

    let appId;
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = await addDoc(collection(db, "event_applications"), newApp);
      fetchApplications(userRole === "admin", user?.uid);
      appId = docRef.id;
    } else {
      const mockId = "mock-app-" + Date.now();
      const localApps = localStorage.getItem("mock_event_applications");
      const currentList = localApps ? JSON.parse(localApps) : [];
      const updatedList = [{ id: mockId, ...newApp }, ...currentList];
      localStorage.setItem(
        "mock_event_applications",
        JSON.stringify(updatedList),
      );
      fetchApplications(userRole === "admin", user?.uid);
      appId = mockId;
    }

    if (user?.uid) {
      await awardBadgeToUser(user.uid, "Aktif Katılımcı");
    }
    return appId;
  };

  // Approve Application
  const approveApplication = async (appId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, "event_applications", appId);
      await updateDoc(docRef, { onaylandi: true });
    }
    // Update local state
    setApplications((prev) =>
      prev.map((item) =>
        item.id === appId ? { ...item, onaylandi: true } : item,
      ),
    );
    if (auth.config.apiKey.includes("DummyKey")) {
      const localApps = localStorage.getItem("mock_event_applications");
      if (localApps) {
        const updated = JSON.parse(localApps).map((item) =>
          item.id === appId ? { ...item, onaylandi: true } : item,
        );
        localStorage.setItem(
          "mock_event_applications",
          JSON.stringify(updated),
        );
      }
    }
  };

  // Reject/Delete Application
  const rejectApplication = async (appId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, "event_applications", appId);
      await deleteDoc(docRef);
    }
    setApplications((prev) => prev.filter((item) => item.id !== appId));
    if (auth.config.apiKey.includes("DummyKey")) {
      const localApps = localStorage.getItem("mock_event_applications");
      if (localApps) {
        const updated = JSON.parse(localApps).filter(
          (item) => item.id !== appId,
        );
        localStorage.setItem(
          "mock_event_applications",
          JSON.stringify(updated),
        );
      }
    }
  };

  // Add Event
  const addEvent = async (eventData) => {
    const newEvent = {
      ...eventData,
      creatorId: user ? user.uid : "",
      onaylandi: false,
      oneCikar: false,
      yaklasan: eventData.durum === "duyuru",
      olusturmaTarihi: new Date().toISOString(),
      guncellemeTarihi: new Date().toISOString(),
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = await addDoc(collection(db, "events"), newEvent);
      return docRef.id;
    } else {
      // Mock flow
      const mockId = "mock-event-" + Date.now();
      setEvents((prev) => [...prev, { id: mockId, ...newEvent }]);
      return mockId;
    }
  };

  // Update Event (Edit support)
  const updateEvent = async (eventId, eventData) => {
    const updatedEvent = {
      ...eventData,
      guncellemeTarihi: new Date().toISOString(),
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, "events", eventId);
      await updateDoc(docRef, updatedEvent);
    }
    setEvents((prev) =>
      prev.map((item) =>
        item.id === eventId ? { ...item, ...updatedEvent } : item,
      ),
    );
    if (auth.config.apiKey.includes("DummyKey")) {
      refreshData();
    }
  };

  // Delete Event
  const deleteEvent = async (eventId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, "events", eventId);
      await deleteDoc(docRef);
    }
    setEvents((prev) => prev.filter((item) => item.id !== eventId));
    if (auth.config.apiKey.includes("DummyKey")) {
      refreshData();
    }
  };

  // Delete Project
  const deleteProject = async (projectId) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, "projects", projectId);
      await deleteDoc(docRef);
    }
    setProjects((prev) => prev.filter((item) => item.id !== projectId));
    if (auth.config.apiKey.includes("DummyKey")) {
      refreshData();
    }
  };

  // Add Project
  const addProject = async (projectData) => {
    const newProject = {
      ...projectData,
      userId: user ? user.uid : "",
      onaylandi: false,
      oneCikar: false,
      olusturmaTarihi: new Date().toISOString(),
      guncellemeTarihi: new Date().toISOString(),
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = await addDoc(collection(db, "projects"), newProject);
      return docRef.id;
    } else {
      // Mock flow
      const mockId = "mock-project-" + Date.now();
      setProjects((prev) => [...prev, { id: mockId, ...newProject }]);
      return mockId;
    }
  };

  // Helper to compress image and convert to Base64
  const compressImage = (
    file,
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.7,
  ) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // File Upload helper
  const uploadFile = async (file) => {
    try {
      const compressedDataUrl = await compressImage(file);
      return compressedDataUrl;
    } catch (error) {
      console.error(
        "Görsel sıkıştırma hatası, orijinal base64 kullanılıyor:",
        error,
      );
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    }
  };

  // Moderator Action: Approve Item
  const approveItem = async (colName, id) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, { onaylandi: true });
    }
    if (colName === "events") {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, onaylandi: true } : item,
        ),
      );
      const ev = events.find((e) => e.id === id);
      if (ev && ev.creatorId) {
        await createNotification(
          ev.creatorId,
          "Etkinliğiniz Onaylandı",
          `"${ev.ad}" adlı etkinliğiniz onaylandı.`,
          "event",
          "events",
        );
      }
    } else {
      setProjects((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, onaylandi: true } : item,
        ),
      );
      const proj = projects.find((p) => p.id === id);
      if (proj && proj.userId) {
        await createNotification(
          proj.userId,
          "Projeniz Onaylandı",
          `"${proj.ad}" adlı projeniz onaylandı.`,
          "project",
          "projects",
        );
        await awardBadgeToUser(proj.userId, "Girişimci");
      }
    }
  };

  // Moderator Action: Reject/Delete Item
  const rejectItem = async (colName, id) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
    }
    if (colName === "events") {
      setEvents((prev) => prev.filter((item) => item.id !== id));
    } else {
      setProjects((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Moderator Action: Star/Feature Item
  const starItem = async (colName, id, value) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, { oneCikar: value });
    }
    if (colName === "events") {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, oneCikar: value } : item,
        ),
      );
    } else {
      setProjects((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, oneCikar: value } : item,
        ),
      );
    }
  };

  // Moderator Login
  const loginModerator = async (email, password) => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (
          userData.role !== "admin" &&
          userData.role !== "coordinator" &&
          userData.role !== "commission" &&
          !userData.onaylandi
        ) {
          await signOut(auth);
          throw new Error(
            "Hesabınız henüz moderatör tarafından onaylanmamıştır.",
          );
        }
      }
    } else {
      // Mock Login bypass
      const localUsers = localStorage.getItem("mock_users");
      const parsedUsers = localUsers ? JSON.parse(localUsers) : [];

      // Check admin
      if (email === "admin@genctek.org" && password && password.length >= 6) {
        setUser({ email, uid: "mock-admin-uid" });
        setUserRole("admin");
        fetchData(true);
        fetchApplications(true);
        return;
      }

      // Find user in mock_users
      const matchedUser = parsedUsers.find((u) => u.eposta === email);
      if (matchedUser) {
        if (
          matchedUser.role !== "admin" &&
          matchedUser.role !== "coordinator" &&
          matchedUser.role !== "commission" &&
          !matchedUser.onaylandi
        ) {
          throw new Error(
            "Hesabınız henüz moderatör tarafından onaylanmamıştır.",
          );
        }

        if (password && password.length >= 6) {
          setUser({ email, uid: matchedUser.uid });
          setUserRole(matchedUser.role);
          setUserProfile(matchedUser);
          if (
            matchedUser.role === "teacher" ||
            matchedUser.role === "principal"
          ) {
            setTeacherProfile(matchedUser);
            fetchStudents(matchedUser.uid);
            fetchData(false);
            fetchApplications(false, matchedUser.uid);
          } else if (
            matchedUser.role === "coordinator" ||
            matchedUser.role === "commission"
          ) {
            setTeacherProfile(matchedUser); // backward compatibility
            fetchData(true);
            fetchApplications(
              false,
              matchedUser.uid,
              matchedUser.role === "coordinator",
              matchedUser.il,
              matchedUser.role === "commission",
            );
          } else if (matchedUser.role === "student") {
            fetchData(false);
            fetchApplications(
              false,
              matchedUser.studentProfile?.teacherId || null,
              false,
            );
          }

          const schoolId = matchedUser.schoolId || matchedUser.okul || "";
          fetchGroups(
            matchedUser.uid,
            matchedUser.role,
            matchedUser.il,
            schoolId,
          );
          return;
        }
      }

      // Fallback legacy checks
      const savedProfile = localStorage.getItem("mock_teacher_profile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.eposta === email && password && password.length >= 6) {
          setUser({ email, uid: profile.uid });
          setUserRole("teacher");
          setTeacherProfile(profile);
          fetchStudents(profile.uid);
          fetchData(false);
          fetchApplications(false, profile.uid);
          return;
        }
      }

      const coordProfiles = localStorage.getItem("mock_coordinator_profiles");
      if (coordProfiles) {
        const matched = JSON.parse(coordProfiles).find(
          (c) => c.eposta === email,
        );
        if (matched && password && password.length >= 6) {
          setUser({ email, uid: matched.id });
          setUserRole("coordinator");
          setTeacherProfile(matched);
          fetchData(true);
          fetchApplications(false, matched.id, true, matched.il);
          return;
        }
      }

      throw new Error(
        "Geçersiz e-posta veya şifre (Mock modunda geçerli bir demo e-postası girin ve en az 6 karakterli herhangi bir şifre kullanın)",
      );
    }
  };

  // Moderator Logout
  const logoutModerator = async () => {
    if (!auth.config.apiKey.includes("DummyKey")) {
      await signOut(auth);
    } else {
      setUser(null);
      setUserRole(null);
      setTeacherProfile(null);
      setStudents([]);
      setApplications([]);
      fetchData(false);
    }
  };

  // Helper to calculate total approved students in an event
  const getApprovedStudentCount = (eventId) => {
    const eventApps = applications.filter(
      (app) => app.etkinlikId === eventId && app.onaylandi,
    );
    return eventApps.reduce(
      (total, app) => total + (app.ogrenciler?.length || 0),
      0,
    );
  };

  // Memoized handlers for city/district updates to ensure referential stability
  const handleSetSelectedCity = useCallback(
    (city) => {
      setSelectedCity(city);
      setSelectedDistrict("");
      setSelectedSchool("");
      loadSchoolsForCity(city);
    },
    [loadSchoolsForCity],
  );

  const handleSetSelectedDistrict = useCallback((dist) => {
    setSelectedDistrict(dist);
    setSelectedSchool("");
  }, []);

  // Filter computation (useMemo prevents referential instability and render loops)
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCity = selectedCity
        ? event.il === selectedCity ||
          (event.duzenleyenIller &&
            event.duzenleyenIller.includes(selectedCity)) ||
          event.kapsam === "turkiye"
        : true;

      const matchesDistrict = selectedDistrict
        ? event.ilce === selectedDistrict
        : true;

      const matchesSchool = selectedSchool
        ? event.okul?.ad === selectedSchool
        : true;

      const matchesTheme = filters.theme ? event.tema === filters.theme : true;
      const matchesFormat = filters.format
        ? event.format === filters.format
        : true;
      const matchesSearch = filters.search
        ? event.ad.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.aciklama.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      return (
        matchesCity &&
        matchesDistrict &&
        matchesSchool &&
        matchesTheme &&
        matchesFormat &&
        matchesSearch
      );
    });
  }, [events, selectedCity, selectedDistrict, selectedSchool, filters]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCity = selectedCity
        ? project.katilimciIller?.includes(selectedCity)
        : true;
      const matchesTheme = filters.theme
        ? project.tema === filters.theme
        : true;
      const matchesSearch = filters.search
        ? project.ad.toLowerCase().includes(filters.search.toLowerCase()) ||
          project.takimAdi
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          project.aciklama.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      return matchesCity && matchesTheme && matchesSearch;
    });
  }, [projects, selectedCity, filters]);

  // List of active cities (that have events or projects) for map highlighting
  const activeCitiesList = useMemo(() => {
    const list = new Set();
    filteredEvents
      .filter((e) => e.onaylandi)
      .forEach((e) => {
        if (e.il) list.add(e.il);
        if (e.duzenleyenIller && Array.isArray(e.duzenleyenIller)) {
          e.duzenleyenIller.forEach((c) => list.add(c));
        }
      });
    filteredProjects
      .filter((p) => p.onaylandi)
      .forEach((p) => {
        p.katilimciIller?.forEach((c) => list.add(c));
      });
    return Array.from(list);
  }, [filteredEvents, filteredProjects]);

  // Admin Action: Add New Coordinator
  const addCoordinator = useCallback(async (coordinatorData) => {
    const newCoord = {
      ...coordinatorData,
      rol: "coordinator",
      olusturmaTarihi: new Date().toISOString(),
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const docId = "coord-" + Date.now();
      await setDoc(doc(db, "teachers", docId), { uid: docId, ...newCoord });
      await setDoc(doc(db, "users", docId), {
        uid: docId,
        ...newCoord,
        role: "coordinator",
      });
    } else {
      const coordId = "mock-coord-" + Date.now();
      const newCoordWithId = {
        id: coordId,
        uid: coordId,
        ...newCoord,
        role: "coordinator",
        il: coordinatorData.il,
      };
      const localProfile = localStorage.getItem("mock_coordinator_profiles");
      const currentList = localProfile ? JSON.parse(localProfile) : [];
      const updatedList = [newCoordWithId, ...currentList];
      localStorage.setItem(
        "mock_coordinator_profiles",
        JSON.stringify(updatedList),
      );

      const localUsers = localStorage.getItem("mock_users");
      const parsedUsers = localUsers ? JSON.parse(localUsers) : [];
      parsedUsers.push(newCoordWithId);
      localStorage.setItem("mock_users", JSON.stringify(parsedUsers));
    }
  }, []);

  // Moderator Action: Add New Commission Member
  const addCommissionMember = useCallback(async (commissionData) => {
    const newCommission = {
      ...commissionData,
      role: "commission",
      olusturmaTarihi: new Date().toISOString(),
    };

    if (!auth.config.apiKey.includes("DummyKey")) {
      const docId = "commission-" + Date.now();
      await setDoc(doc(db, "users", docId), { uid: docId, ...newCommission });
    } else {
      const localUsers = localStorage.getItem("mock_users");
      const parsedUsers = localUsers ? JSON.parse(localUsers) : [];
      const commissionId = "mock-commission-" + Date.now();
      const newCommissionWithId = {
        id: commissionId,
        uid: commissionId,
        ...newCommission,
        role: "commission",
      };
      parsedUsers.push(newCommissionWithId);
      localStorage.setItem("mock_users", JSON.stringify(parsedUsers));
    }
  }, []);

  // Direct Messaging Actions
  const fetchDirectMessages = useCallback((currentUserId) => {
    if (!currentUserId) return () => {};
    try {
      if (!auth.config.apiKey.includes("DummyKey")) {
        const q1 = query(
          collection(db, "direct_messages"),
          where("senderId", "==", currentUserId),
        );
        const q2 = query(
          collection(db, "direct_messages"),
          where("receiverId", "==", currentUserId),
        );

        let messages1 = [];
        let messages2 = [];

        const updateMessages = () => {
          const merged = [];
          const ids = new Set();

          messages1.forEach((m) => {
            if (!ids.has(m.id)) {
              merged.push(m);
              ids.add(m.id);
            }
          });
          messages2.forEach((m) => {
            if (!ids.has(m.id)) {
              merged.push(m);
              ids.add(m.id);
            }
          });

          merged.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
          setDirectMessages(merged);
        };

        const unsub1 = onSnapshot(q1, (snap) => {
          messages1 = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          updateMessages();
        });

        const unsub2 = onSnapshot(q2, (snap) => {
          messages2 = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          updateMessages();
        });

        return () => {
          unsub1();
          unsub2();
        };
      } else {
        const local = localStorage.getItem("mock_direct_messages");
        const allMessages = local ? JSON.parse(local) : [];
        const filtered = allMessages.filter(
          (m) => m.senderId === currentUserId || m.receiverId === currentUserId,
        );
        filtered.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
        setTimeout(() => setDirectMessages(filtered), 0);
        return () => {};
      }
    } catch (err) {
      console.error("Error fetching direct messages:", err);
      return () => {};
    }
  }, []);

  const sendDirectMessage = useCallback(
    async (receiverId, receiverName, receiverRole, messageText) => {
      if (!user || !messageText.trim()) return;

      const newMessage = {
        senderId: user.uid,
        senderName: userProfile?.adSoyad || user.email,
        senderRole: userRole,
        receiverId,
        receiverName,
        receiverRole,
        il: userProfile?.il || "",
        mesaj: messageText,
        tarih: new Date().toISOString(),
        okundu: false,
      };

      try {
        let msgId;
        if (!auth.config.apiKey.includes("DummyKey")) {
          const docRef = await addDoc(
            collection(db, "direct_messages"),
            newMessage,
          );
          await createNotification(
            receiverId,
            "Yeni Mesaj",
            `${userProfile?.adSoyad || user.email} size bir mesaj gönderdi.`,
            "message",
            "messages",
          );
          msgId = docRef.id;
        } else {
          const local = localStorage.getItem("mock_direct_messages");
          const list = local ? JSON.parse(local) : [];
          const mockMsgId = "mock-msg-" + Date.now();
          const msgWithId = { id: mockMsgId, ...newMessage };
          list.push(msgWithId);
          localStorage.setItem("mock_direct_messages", JSON.stringify(list));
          fetchDirectMessages(user.uid);
          await createNotification(
            receiverId,
            "Yeni Mesaj",
            `${userProfile?.adSoyad || user.email} size bir mesaj gönderdi.`,
            "message",
            "messages",
          );
          msgId = mockMsgId;
        }

        await awardBadgeToUser(user.uid, "İletişimci");
        return msgId;
      } catch (err) {
        console.error("Error sending direct message:", err);
        throw err;
      }
    },
    [
      user,
      userProfile,
      userRole,
      fetchDirectMessages,
      createNotification,
      awardBadgeToUser,
    ],
  );

  const markMessagesAsRead = useCallback(
    async (senderId) => {
      if (!user || !senderId) return;
      try {
        if (!auth.config.apiKey.includes("DummyKey")) {
          const q = query(
            collection(db, "direct_messages"),
            where("senderId", "==", senderId),
            where("receiverId", "==", user.uid),
            where("okundu", "==", false),
          );
          const snap = await getDocs(q);
          const promises = [];
          snap.forEach((docSnap) => {
            promises.push(
              updateDoc(doc(db, "direct_messages", docSnap.id), {
                okundu: true,
              }),
            );
          });
          await Promise.all(promises);
        } else {
          const local = localStorage.getItem("mock_direct_messages");
          const allMessages = local ? JSON.parse(local) : [];
          let updated = false;
          const newList = allMessages.map((m) => {
            if (
              m.senderId === senderId &&
              m.receiverId === user.uid &&
              !m.okundu
            ) {
              updated = true;
              return { ...m, okundu: true };
            }
            return m;
          });
          if (updated) {
            localStorage.setItem(
              "mock_direct_messages",
              JSON.stringify(newList),
            );
            fetchDirectMessages(user.uid);
          }
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    },
    [user, fetchDirectMessages],
  );

  const fetchChatContacts = useCallback(async (role, il) => {
    if (!il) return;
    try {
      let usersList = [];
      if (!auth.config.apiKey.includes("DummyKey")) {
        const q = query(collection(db, "users"), where("il", "==", il));
        const snap = await getDocs(q);
        snap.forEach((doc) => {
          usersList.push({ uid: doc.id, ...doc.data() });
        });
      } else {
        const local = localStorage.getItem("mock_users");
        usersList = local ? JSON.parse(local) : [];
        if (role !== "admin") {
          usersList = usersList.filter((u) => u.il === il);
        }
      }

      if (role === "student") {
        const filtered = usersList.filter(
          (u) => u.role === "coordinator" || u.role === "commission",
        );
        setTimeout(() => setChatContacts(filtered), 0);
      } else if (
        role === "coordinator" ||
        role === "commission" ||
        role === "admin"
      ) {
        const filtered = usersList.filter(
          (u) =>
            u.role === "student" ||
            u.role === "coordinator" ||
            u.role === "commission",
        );
        setTimeout(() => setChatContacts(filtered), 0);
      }
    } catch (err) {
      console.error("Error fetching chat contacts:", err);
    }
  }, []);

  // Fetch messages, notifications, announcements, and contacts automatically when user or city details are loaded
  useEffect(() => {
    let unsubDM = () => {};
    let unsubNotif = () => {};
    let unsubAnn = () => {};

    if (user && userRole) {
      unsubDM = fetchDirectMessages(user.uid);
      unsubNotif = fetchNotifications(user.uid);
      const userCity = userProfile?.il || teacherProfile?.il || "";
      if (userCity) {
        fetchChatContacts(userRole, userCity);
      }
    }

    unsubAnn = fetchAnnouncements();

    return () => {
      unsubDM();
      unsubNotif();
      unsubAnn();
    };
  }, [
    user,
    userRole,
    userProfile,
    teacherProfile,
    fetchDirectMessages,
    fetchChatContacts,
    fetchNotifications,
    fetchAnnouncements,
  ]);

  // Online/Offline status listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      createNotification(
        user?.uid || "global",
        "⚡ İnternet bağlantısı sağlandı. Çevrimiçi moda geçildi.",
        "success",
      );
    };
    const handleOffline = () => {
      setIsOffline(true);
      createNotification(
        user?.uid || "global",
        "⚠️ İnternet bağlantısı kesildi. Çevrimdışı moda geçildi (Veriler önbellekten sunuluyor).",
        "warning",
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user, createNotification]);

  const refreshData = useCallback(() => {
    const isAdmin = !!user && userRole === "admin";
    const isCoordinator = !!user && userRole === "coordinator";
    const city = teacherProfile?.il || "";
    const schoolId = teacherProfile?.schoolId || teacherProfile?.okul || "";

    fetchData(isAdmin || isCoordinator);
    if (user) {
      fetchApplications(isAdmin, user.uid, isCoordinator, city);
      fetchGroups(user.uid, userRole, city, schoolId);
      if (userRole === "teacher") {
        fetchStudents(user.uid);
      }
    }
  }, [
    user,
    userRole,
    teacherProfile,
    fetchData,
    fetchApplications,
    fetchStudents,
    fetchGroups,
  ]);

  return (
    <AppContext.Provider
      value={{
        events: filteredEvents,
        projects: filteredProjects,
        allEventsRaw: events,
        allProjectsRaw: projects,
        themes: themesData,
        cities: citiesData,
        activeCitiesList,
        selectedCity,
        setSelectedCity: handleSetSelectedCity,
        selectedDistrict,
        setSelectedDistrict: handleSetSelectedDistrict,
        selectedSchool,
        setSelectedSchool,
        schoolsData,
        schoolsLoading,
        loadSchoolsForCity,
        loadSchoolsDataForCity,
        addCustomSchool,
        updateCustomSchool,
        addCoordinator,
        addCommissionMember,
        directMessages,
        chatContacts,
        fetchDirectMessages,
        sendDirectMessage,
        fetchChatContacts,
        markMessagesAsRead,
        filters,
        setFilters,
        loading,
        modalType,
        setModalType,
        user,
        userRole,
        teacherProfile,
        userProfile,
        students,
        applications,
        loginModerator,
        logoutModerator,
        registerTeacher,
        registerUser,
        registerStudent,
        toggleStudentRepStatus,
        updateUserProfileData,
        updateUserRole,
        updateModeratorOrCommission,
        deleteModeratorOrCommission,
        addStudent,
        updateStudent,
        deleteStudent,
        addEventApplication,
        approveApplication,
        rejectApplication,
        getApprovedStudentCount,
        addEvent,
        updateEvent,
        deleteEvent,
        deleteProject,
        editingEvent,
        setEditingEvent,
        addProject,
        uploadFile,
        approveItem,
        rejectItem,
        starItem,
        selectedDetailEvent,
        setSelectedDetailEvent,
        isUsingMockData,
        refreshData,
        groups,
        activeGroup,
        groupAnnouncements,
        groupTasks,
        fetchGroups,
        fetchGroupDetails,
        createStudyGroup,
        joinStudyGroupWithCode,
        joinStudyGroupById,
        createGroupAnnouncement,
        deleteGroupAnnouncement,
        togglePinAnnouncement,
        createGroupTask,
        updateGroupTaskStatus,
        assignTaskToMembers,
        awardXpToUser,
        notifications,
        announcements,
        createNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addAnnouncement,
        schoolStudents,
        schoolGroups,
        schoolDataLoading,
        fetchSchoolDetails,
        isOffline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
