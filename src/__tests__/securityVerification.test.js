import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const readProjectFile = (path) => readFileSync(resolve(rootDir, path), "utf8");

describe("QA and security verification checks", () => {
  it("keeps Firestore role and private-message guards in rules", () => {
    const firestoreRules = readProjectFile("firestore.rules");

    expect(firestoreRules).toContain(
      "!(request.resource.data.role in ['admin', 'coordinator', 'commission'])",
    );
    expect(firestoreRules).toMatch(
      /match \/direct_messages\/\{messageId\} \{[\s\S]*allow read: if isSignedIn\(\) && \(request\.auth\.uid == resource\.data\.senderId \|\| request\.auth\.uid == resource\.data\.receiverId\);/,
    );
    expect(firestoreRules).toContain(
      "allow create: if isSignedIn() && request.auth.uid == request.resource.data.senderId;",
    );
    expect(firestoreRules).toContain(
      "allow read, delete: if isSignedIn() && resource.data.userId == request.auth.uid;",
    );
    expect(firestoreRules).toContain(
      "request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read'])",
    );
  });

  it("keeps pending-by-default submission contracts in app code", () => {
    const appContext = readProjectFile("src/context/AppContext.jsx");

    expect(appContext).toMatch(
      /const addEventApplication = async \(applicationData\) => \{[\s\S]*onaylandi: false/,
    );
    expect(appContext).toMatch(
      /const addEvent = async \(eventData\) => \{[\s\S]*onaylandi: false/,
    );
    expect(appContext).toMatch(
      /const addProject = async \(projectData\) => \{[\s\S]*onaylandi: false/,
    );
    expect(appContext).toContain(
      'eventsQuery = query(eventsRef, where("onaylandi", "==", true));',
    );
    expect(appContext).toContain(
      'projectsQuery = query(projectsRef, where("onaylandi", "==", true));',
    );
  });

  it("keeps client validation aligned with documented security checks", () => {
    const projectForm = readProjectFile("src/components/ProjectForm.jsx");
    const storageRules = readProjectFile("storage.rules");

    expect(projectForm).toContain('startsWith("https://github.com/")');
    expect(projectForm).toContain("image/jpeg");
    expect(projectForm).toContain("image/png");
    expect(projectForm).toContain("image/webp");
    expect(projectForm).toContain("selectedFile.size > 5 * 1024 * 1024");
    expect(projectForm).toContain("selectedFile.size > 2 * 1024 * 1024");

    expect(storageRules).toContain("request.resource.size < 5 * 1024 * 1024");
    expect(storageRules).toContain("request.resource.size < 2 * 1024 * 1024");
    expect(storageRules).toContain(
      "request.resource.contentType == 'image/jpeg'",
    );
    expect(storageRules).toContain(
      "request.resource.contentType == 'image/png'",
    );
    expect(storageRules).toContain(
      "request.resource.contentType == 'image/webp'",
    );
    expect(storageRules).toContain(
      "request.resource.contentType == 'text/plain'",
    );
    expect(storageRules).toContain(
      "request.resource.contentType == 'text/markdown'",
    );
  });

  it("keeps Firebase Hosting security headers configured", () => {
    const firebaseConfig = JSON.parse(readProjectFile("firebase.json"));
    const headers = firebaseConfig.hosting.headers?.[0]?.headers || [];
    const headerByKey = Object.fromEntries(
      headers.map((header) => [header.key, header.value]),
    );

    expect(headerByKey["Content-Security-Policy"]).toContain(
      "default-src 'self'",
    );
    expect(headerByKey["Content-Security-Policy"]).toContain(
      "object-src 'none'",
    );
    expect(headerByKey["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headerByKey["Content-Security-Policy"]).toContain(
      "https://firestore.googleapis.com",
    );
    expect(headerByKey["Content-Security-Policy"]).toContain(
      "https://*.tile.openstreetmap.org",
    );
    expect(headerByKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerByKey["Referrer-Policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headerByKey["Permissions-Policy"]).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
    expect(headerByKey["X-Frame-Options"]).toBe("DENY");
  });
});
