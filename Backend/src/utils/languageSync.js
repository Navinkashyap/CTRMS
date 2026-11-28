import Language from "../models/Language.js";
import MotherTongue from "../models/MotherTongue.js";

// Language and Mother Tongue are the same list of names maintained on two
// Master Data pages. They are kept in lock-step so a language added on either
// page is selectable in both (and in the Vendor Manager, Vendor and PM portals,
// which read from these masters).
//
// Matching is by name, case-insensitively. Failures never block the caller's
// own write — the sync is best-effort and is re-run in full on server start.

const exact = (name) => ({
  name: { $regex: `^${String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
});

const clean = (name) => String(name || "").trim();

// Create `name` in `Model` if absent. Returns true when it created a document.
async function ensure(Model, name, status = "Active") {
  const n = clean(name);
  if (!n) return false;
  if (await Model.exists(exact(n))) return false;
  await Model.create({ name: n, status });
  return true;
}

// Called after a Language is created/updated. `previousName` is the name before
// an edit, so a rename carries across instead of leaving a stray duplicate.
export async function syncLanguageToMotherTongue(language, previousName) {
  try {
    const name = clean(language?.name);
    if (!name) return;
    const prev = clean(previousName);
    if (prev && prev.toLowerCase() !== name.toLowerCase()) {
      const existing = await MotherTongue.findOne(exact(prev));
      if (existing && !(await MotherTongue.exists(exact(name)))) {
        existing.name = name;
        existing.status = language.status || existing.status;
        await existing.save();
        return;
      }
    }
    const match = await MotherTongue.findOne(exact(name));
    if (match) {
      if (language.status && match.status !== language.status) {
        match.status = language.status;
        await match.save();
      }
    } else {
      await ensure(MotherTongue, name, language.status || "Active");
    }
  } catch (error) {
    console.error("Language → Mother Tongue sync failed:", error.message);
  }
}

export async function syncMotherTongueToLanguage(motherTongue, previousName) {
  try {
    const name = clean(motherTongue?.name);
    if (!name) return;
    const prev = clean(previousName);
    if (prev && prev.toLowerCase() !== name.toLowerCase()) {
      const existing = await Language.findOne(exact(prev));
      if (existing && !(await Language.exists(exact(name)))) {
        existing.name = name;
        existing.status = motherTongue.status || existing.status;
        await existing.save();
        return;
      }
    }
    const match = await Language.findOne(exact(name));
    if (match) {
      if (motherTongue.status && match.status !== motherTongue.status) {
        match.status = motherTongue.status;
        await match.save();
      }
    } else {
      await ensure(Language, name, motherTongue.status || "Active");
    }
  } catch (error) {
    console.error("Mother Tongue → Language sync failed:", error.message);
  }
}

// Deleting a Language removes its Mother Tongue twin. The reverse is deliberately
// not done: Languages are referenced by projects and vendor rates, so removing a
// Mother Tongue must never delete a Language that live data may point at.
export async function removeMotherTongueFor(languageName) {
  try {
    const name = clean(languageName);
    if (name) await MotherTongue.deleteMany(exact(name));
  } catch (error) {
    console.error("Mother Tongue cleanup failed:", error.message);
  }
}

// Fill in whatever is missing on either side. Idempotent; only ever adds.
export async function backfillLanguageMasters() {
  try {
    const [languages, tongues] = await Promise.all([
      Language.find().select("name status").lean(),
      MotherTongue.find().select("name status").lean(),
    ]);
    const have = (list) => new Set(list.map((x) => clean(x.name).toLowerCase()));
    const langNames = have(languages);
    const tongueNames = have(tongues);
    let addedTongues = 0;
    let addedLangs = 0;
    for (const l of languages) {
      if (!tongueNames.has(clean(l.name).toLowerCase())) {
        if (await ensure(MotherTongue, l.name, l.status)) addedTongues += 1;
      }
    }
    for (const t of tongues) {
      if (!langNames.has(clean(t.name).toLowerCase())) {
        if (await ensure(Language, t.name, t.status)) addedLangs += 1;
      }
    }
    if (addedTongues || addedLangs) {
      console.log(
        `Language/Mother Tongue sync: added ${addedTongues} mother tongue(s) and ${addedLangs} language(s).`
      );
    }
  } catch (error) {
    console.error("Language/Mother Tongue backfill failed:", error.message);
  }
}
