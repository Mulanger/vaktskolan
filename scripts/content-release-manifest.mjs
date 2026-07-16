import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const manifestPath = join(root, "content", "release-manifest.json");
const checkOnly = process.argv.includes("--check");
const releaseIdArgument = process.argv.find((argument) => argument.startsWith("--release-id="));

function toPosixPath(value) {
  return value.replaceAll("\\", "/");
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function getReleaseFiles() {
  const guideDirectory = join(root, "content", "guides");
  const guideFiles = readdirSync(guideDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => join(guideDirectory, fileName));
  const sourceFiles = [
    join(root, "utbildning.md"),
    join(root, "vu1quiz.json"),
    join(root, "vu2quiz.json"),
    join(root, "vaktarskolan_flashcards_200.json"),
    join(root, "supabase", "seeds", "20260705143000_seed_scenario_quiz_300.sql"),
    ...guideFiles,
  ];

  return sourceFiles
    .map((filePath) => {
      if (!existsSync(filePath)) throw new Error(`Releasefil saknas: ${relative(root, filePath)}`);
      const bytes = readFileSync(filePath);
      return {
        path: toPosixPath(relative(root, filePath)),
        bytes: bytes.length,
        sha256: sha256(bytes),
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path, "sv"));
}

function getContentVersion(files) {
  return sha256(files.map((file) => `${file.path}:${file.sha256}`).join("\n"));
}

function validateApproval(name, approval) {
  if (!approval || !["pending", "approved", "rejected"].includes(approval.status)) {
    throw new Error(`${name}: ogiltig granskningsstatus.`);
  }
  if (approval.status === "approved" && (!approval.reviewer || !approval.role || !approval.signedAt)) {
    throw new Error(`${name}: godkänd granskning kräver reviewer, role och signedAt.`);
  }
}

function validateManifest(manifest, files) {
  if (manifest.schemaVersion !== 1) throw new Error("Release-manifestet har fel schemaVersion.");
  if (!manifest.releaseId || !manifest.contentVersion) throw new Error("Release-manifestet saknar releaseId eller contentVersion.");

  const expectedPaths = files.map((file) => file.path);
  const manifestPaths = Array.isArray(manifest.files) ? manifest.files.map((file) => file.path) : [];
  if (JSON.stringify(manifestPaths) !== JSON.stringify(expectedPaths)) {
    throw new Error("Release-manifestets fillista matchar inte det aktuella innehållet.");
  }

  files.forEach((file, index) => {
    const registered = manifest.files[index];
    if (registered.sha256 !== file.sha256 || registered.bytes !== file.bytes) {
      throw new Error(`${file.path}: innehållet har ändrats efter att release-manifestet skapades.`);
    }
  });

  const expectedVersion = getContentVersion(files);
  if (manifest.contentVersion !== expectedVersion) {
    throw new Error("Release-manifestets contentVersion matchar inte filhasharna.");
  }

  validateApproval("legalReview", manifest.reviews?.legal);
  validateApproval("subjectMatterReview", manifest.reviews?.subjectMatter);
  const allApproved = manifest.reviews.legal.status === "approved" && manifest.reviews.subjectMatter.status === "approved";
  if (manifest.releaseReady !== allApproved) {
    throw new Error("releaseReady måste motsvara de två granskningsbesluten.");
  }

  const currentFapUrl = "https://polisen.se/siteassets/forfattningssamling/fap-nummer/fap573-01-pmfs2017_10/";
  if (!manifest.sourceChecks?.some((source) => source.url === currentFapUrl && source.verifiedAt)) {
    throw new Error("Release-manifestet saknar verifierad hänvisning till aktuell FAP 573-01.");
  }
}

const files = getReleaseFiles();

if (checkOnly) {
  if (!existsSync(manifestPath)) throw new Error("content/release-manifest.json saknas.");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  validateManifest(manifest, files);
  console.log(`Validated content release ${manifest.releaseId} (${manifest.contentVersion.slice(0, 12)}).`);
} else {
  if (!releaseIdArgument) {
    throw new Error("Ange ett versions-id, exempelvis --release-id=2026-07-16-prelaunch.1");
  }

  const releaseId = releaseIdArgument.split("=").slice(1).join("=").trim();
  if (!/^[a-z0-9][a-z0-9._-]{5,79}$/i.test(releaseId)) throw new Error("Ogiltigt releaseId.");
  const now = new Date().toISOString();
  const manifest = {
    schemaVersion: 1,
    releaseId,
    contentVersion: getContentVersion(files),
    generatedAt: now,
    releaseReady: false,
    reviews: {
      legal: { status: "pending", reviewer: null, role: null, signedAt: null, notes: "Inväntar juridisk granskning." },
      subjectMatter: { status: "pending", reviewer: null, role: null, signedAt: null, notes: "Inväntar sakkunnig granskning." },
    },
    sourceChecks: [
      {
        id: "polisen-fap-573-01-pmfs-2017-10",
        publisher: "Polismyndigheten",
        title: "PMFS 2017:10, FAP 573-01",
        url: "https://polisen.se/siteassets/forfattningssamling/fap-nummer/fap573-01-pmfs2017_10/",
        verifiedAt: now.slice(0, 10),
      },
    ],
    files,
  };

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Created content release ${releaseId} (${manifest.contentVersion}).`);
}
