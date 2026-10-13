"""storyboard_lint.py: the template's example shot list must be green, a "wall of bullet points" shot list must be red,
and the red reasons must be right. Standard library only; also runs in CI."""
import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "storyboard_lint.py"
TEMPLATE = ROOT / "references" / "shot-list-template.md"
spec = importlib.util.spec_from_file_location("storyboard_lint", SCRIPT)
SL = importlib.util.module_from_spec(spec)
spec.loader.exec_module(SL)

# One whiteboard clip carrying the film from start to finish: a title opening, bullet points appearing one by one,
# shots of over ten seconds, the same clip for 60 seconds.
WALL = """# Shot list

| Time | Object in frame | Action | Camera | On-screen text | Method |
|---|---|---|---|---|---|
| 0–5 | Title | appears | hold | Why does this happen let us take a look | y3 clip board.json |
| 5–20 | Bullet list | points appear one by one | hold | The first reason is like this | y3 clip board.json |
| 20–35 | Icons | shown | hold | | y3 clip board.json |
| 35–50 | Text | fades in | hold | Point two | y3 clip board.json |
| 50–60 | Summary on the whiteboard | appears one by one | hold | Remember these three points and you are done | y3 clip board.json |
"""


def tags(res, level):
    out = {t for r in res["rows"] for lv, t, *_ in r["issues"] if lv == level}
    return out | {t for lv, t, *_ in res["table"] if lv == level}


class TemplateExample(unittest.TestCase):
    def test_example_is_green(self):
        res = SL.lint(TEMPLATE.read_text(encoding="utf-8"))
        self.assertNotIn("error", res)
        self.assertEqual(res["verdict"], SL.GREEN, "\n".join(SL.report(res)))
        self.assertGreaterEqual(len(res["rows"]), 10)
        self.assertGreaterEqual(res["total"], 45)

    def test_blank_template_in_code_block_is_skipped(self):
        # The template's blank table is inside a code block; lint only reads the example table.
        res = SL.lint(TEMPLATE.read_text(encoding="utf-8"))
        self.assertTrue(res["rows"][0]["obj"].startswith("Xiaoman"))

    def test_cli_exit_zero(self):
        p = subprocess.run([sys.executable, str(SCRIPT), str(TEMPLATE)], capture_output=True, text=True)
        self.assertEqual(p.returncode, 0, p.stdout + p.stderr)
        self.assertIn("green light", p.stdout)


class BulletWall(unittest.TestCase):
    def setUp(self):
        self.res = SL.lint(WALL)

    def test_red(self):
        self.assertEqual(self.res["verdict"], SL.RED)

    def test_reasons(self):
        red = tags(self.res, SL.RED)
        for t in ("①object", "②action", "③on-screen text", "④opening", "⑤text share", "⑥duration", "method"):
            self.assertIn(t, red, "\n".join(SL.report(self.res)))
        self.assertIn("camera", tags(self.res, SL.YELLOW))   # all "hold": ⑦ isn't reported (holds can repeat), the table reports "no camera moves at all"

    def test_points_appearing_is_not_an_action(self):
        r = self.res["rows"][1]
        self.assertTrue(any(t == "②action" for _, t, *_ in r["issues"]))

    def test_one_clip_carrying_the_film(self):
        whats = [w for lv, t, w, _ in self.res["table"] if t == "method"]
        self.assertTrue(any("board.json" in w and "60" in w for w in whats), whats)
        self.assertIn("⑫style lock", tags(self.res, SL.RED))

    def test_cli_exit_nonzero(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "shot-list.md"
            f.write_text(WALL, encoding="utf-8")
            p = subprocess.run([sys.executable, str(SCRIPT), str(f)], capture_output=True, text=True)
        self.assertEqual(p.returncode, 1, p.stdout)
        self.assertIn("red light", p.stdout)


class Rules(unittest.TestCase):
    HEAD = "| Time | Object in frame | Action | Camera | On-screen text | Method |\n|---|---|---|---|---|---|\n"

    def lint(self, *rows):
        return SL.lint(self.HEAD + "\n".join(rows) + "\n")

    def test_concrete_object_with_text_word_is_not_empty(self):
        self.assertTrue(SL.obj_residue("a cat on the whiteboard"))
        self.assertFalse(SL.obj_residue("three key points"))
        self.assertFalse(SL.obj_residue("title and icons on a white background"))

    def test_object_appearing_alone_is_weak(self):
        self.assertFalse(SL.act_residue("the spore appears", "spore"))
        self.assertTrue(SL.act_residue("the spore drifts in through a crack in the window", "spore"))

    def test_text_length(self):
        self.assertEqual(SL.text_len("Starch → sugar"), 2)
        self.assertEqual(SL.text_len("28°C"), 1)
        self.assertEqual(SL.text_len("AI made up a book"), 5)
        self.assertEqual(SL.text_len("\u6dc0\u7c89→\u7cd6"), 3)   # CJK characters count one each
        self.assertEqual(SL.text_len("—"), 0)

    def test_durations(self):
        res = self.lint("| 0–3 | A cat | jumps onto the table | hold | | scenes/a.js |",
                        "| 3–10 | That cat | knocks over a cup | fast push | | scenes/a.js |",
                        "| 10–19 | The cup | breaks in two | slam in | | footage photo |",
                        "| 19–20 | The shards | bounce up | pan | | t3 clip a.json |")
        by = {r["n"]: {(lv, t) for lv, t, *_ in r["issues"]} for r in res["rows"]}
        self.assertIn((SL.YELLOW, "⑥duration"), by[2])
        self.assertIn((SL.RED, "⑥duration"), by[3])
        self.assertIn((SL.YELLOW, "⑥duration"), by[4])

    def test_vertical_bar_fullwidth_and_mmss(self):
        bar = "\uff5c"   # full-width vertical bar
        t = (f"{bar}Time{bar}Object in frame{bar}Action{bar}Camera{bar}On-screen text{bar}\n"
             f"{bar}---{bar}---{bar}---{bar}---{bar}---{bar}\n"
             f"{bar}0:00–0:03{bar}A cat{bar}jumps onto the table{bar}fast push{bar}{bar}\n")
        res = SL.lint(t)
        self.assertEqual(res["rows"][0]["dur"], 3)

    def test_missing_column(self):
        res = SL.lint("| Time | Object in frame | Action |\n|---|---|---|\n| 0–3 | A cat | jumps |\n")
        self.assertIn("missing columns", res["error"])


class EndingAndEmpty(unittest.TestCase):
    HEAD = Rules.HEAD

    def lint(self, *rows, **kw):
        return SL.lint(self.HEAD + "\n".join(rows) + "\n", **kw)

    BODY = ("| 0–3 | A phone | slides off the table into a pocket | hold | | scenes/a.js |",
            "| 3–6 | That phone | its screen lights up and dims again | fast push | | footage screenshot |")

    def test_last_shot_text_card_is_red(self):
        for last in ("| 6–9 | Quote | slams into the frame | slam in | Inner pocket | t2 clip a.json |",
                     "| 6–9 | Big text on yellow | pops out | hold | Inner pocket | t2 clip a.json |",
                     "| 6–9 | That phone | gets tucked back into the pocket | hold | Inner pocket | y5 clip a.json |"):
            res = self.lint(*self.BODY, last)
            self.assertIn((SL.RED, "⑧ending"), {(lv, t) for lv, t, *_ in res["rows"][-1]["issues"]}, last)

    def test_last_shot_on_the_object_passes(self):
        res = self.lint(*self.BODY, "| 6–9 | That phone | gets tucked back into the inner pocket; the camera pulls out to see the whole | pan | Inner pocket | scenes/b.js |")
        self.assertFalse(any(t == "⑧ending" for r in res["rows"] for _, t, *_ in r["issues"]))

    def test_empty_scene_object_is_red(self):
        for obj in ("empty shot", "solid color background", "black frame", "black screen", "all black",
                    "gradient background", "empty scene", "solid orange background"):
            res = self.lint(*self.BODY, f"| 6–9 | {obj} | slowly brightens | hold | | scenes/b.js |")
            hits = [w for lv, t, w, _ in res["rows"][-1]["issues"] if lv == SL.RED and t == "①object"]
            self.assertTrue(hits and "empty frame" in hits[0], (obj, hits))

    def test_object_on_dark_background_is_fine(self):
        self.assertTrue(SL.obj_residue("a cat on a black screen"))
        self.assertTrue(SL.obj_residue("a phone on a gradient background"))


class ScriptNumbers(unittest.TestCase):
    HEAD = Rules.HEAD
    SCRIPT = ("This year it rose sixty percent. After switching to sum() it got fifteen point two times faster; "
              "from twenty twenty-five on, every person gets twelve thousand dollars, and about sixty percent of people have used it.")

    def row_issues(self, text, script=SCRIPT):
        res = SL.lint(self.HEAD + f"| 0–3 | A phone | slides off the table into a pocket | fast push | {text} | scenes/a.js |\n"
                                  "| 3–6 | That phone | gets tucked back into the pocket | hold | | footage screenshot |\n", script=script)
        return [(lv, t, w) for lv, t, w, _ in res["rows"][0]["issues"]], res

    def test_mismatch_is_red(self):
        iss, _ = self.row_issues("up 27%")
        hit = [w for lv, t, w in iss if t == "⑨numbers"]
        self.assertTrue(hit and "27" in hit[0] and "narration" in hit[0], iss)
        self.assertTrue(all(lv == SL.RED for lv, t, _ in iss if t == "⑨numbers"))

    def test_spelled_out_numbers_in_script_match(self):
        for text in ("up 60%", "15.2× faster", "from 2025", "$12k each", "60% of people"):
            iss, _ = self.row_issues(text)
            self.assertFalse([t for _, t, _ in iss if t == "⑨numbers"], (text, iss))

    def test_rounded_speech_matches_precise_screen(self):
        iss, _ = self.row_issues("8.7×", script="Revenue rose to nearly nine times what it was.")
        self.assertFalse([t for _, t, _ in iss if t == "⑨numbers"], iss)
        iss, _ = self.row_issues("15.3×", script="It got fifteen point two times faster.")
        self.assertTrue([t for _, t, _ in iss if t == "⑨numbers"], iss)

    def test_english_number_words(self):
        have = SL.script_numbers("nineteen eighty-four, three hundred eighteen, one point two million, two zero two five")
        for v in (1984, 318, 1.2, 1200000, 2025):
            self.assertTrue(SL.number_in([(v, 0)], have), v)

    def test_no_script_skips_and_hints(self):
        iss, res = self.row_issues("up 27%", script=None)
        self.assertFalse([t for _, t, _ in iss if t == "⑨numbers"])
        self.assertIn("--script", "\n".join(SL.report(res)))

    def test_cli_script(self):
        with tempfile.TemporaryDirectory() as d:
            ok, bad = Path(d) / "ok.txt", Path(d) / "bad.txt"
            ok.write_text("In the kitchen it went from fifteen degrees up to twenty-eight degrees, and mold grows fastest.", encoding="utf-8")
            bad.write_text("The kitchen is warm, and mold grows fastest.", encoding="utf-8")
            p = subprocess.run([sys.executable, str(SCRIPT), str(TEMPLATE), "--script", str(ok)], capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, p.stdout)
            p = subprocess.run([sys.executable, str(SCRIPT), "--script", str(bad), str(TEMPLATE)], capture_output=True, text=True)
            self.assertEqual(p.returncode, 1, p.stdout)
            self.assertIn("the on-screen number and the narration don't match", p.stdout)
            self.assertIn("28", p.stdout)


class TagsColumn(unittest.TestCase):
    HEAD = "| Time | Object in frame | Action | Camera | On-screen text | Tags | Method |\n|---|---|---|---|---|---|---|\n"

    def test_more_than_three_tags_is_yellow(self):
        res = SL.lint(self.HEAD + "| 0–3 | A phone | slides off the table into a pocket | fast push | Light | fast, cheap, stable, precise | scenes/a.js |\n"
                                  "| 3–6 | That phone | gets tucked back into the pocket | hold | | fast, cheap, stable | footage screenshot |\n")
        self.assertEqual(res["rows"][0]["tags"], 4)
        self.assertIn((SL.YELLOW, "⑩tags"), {(lv, t) for lv, t, *_ in res["rows"][0]["issues"]})
        self.assertFalse(any(t == "⑩tags" for _, t, *_ in res["rows"][1]["issues"]))
        self.assertEqual(res["rows"][0]["text"], "Light")          # the tags column is not read as on-screen text

    def test_tag_count(self):
        self.assertEqual(SL.tag_count("fast · cheap · stable · precise"), 4)
        self.assertEqual(SL.tag_count("Claude Code"), 2)
        self.assertEqual(SL.tag_count("—"), 0)


class NumberCardRule(unittest.TestCase):
    def test_middle_number_card_warns(self):
        t = """| Time | Object in frame | Action | Camera | On-screen text | Method |
|---|---|---|---|---|---|
| 0–3 | A person and a cup | the person pours hot water into the cup and the glass fogs up | hold | | scenes/a.js |
| 3–6 | Big text | big text slams into the frame | slam in | 60% | y5 clip a.json |
| 6–9 | That cup | the water slowly cools and the fog clears | fast push | | scenes/a.js |
"""
        res = SL.lint(t)
        msgs = [i[1] for r in res["rows"] for i in r["issues"]]
        self.assertIn("⑪number card", msgs)


class StyleLock(unittest.TestCase):
    """⑫–⑭: lock one art style before the table, one palette without blue-purple, characters either a frame library or faceless;
    at most 2 clip grammars."""
    HEAD = "| Time | Object in frame | Action | Camera | On-screen text | Method |\n|---|---|---|---|---|---|\n"
    LOCK = "Style: paper illustration\nPalette: paper\nCharacter: hands only\n\n"
    ROWS = ["| 0–3 | A cat | jumps onto the table | hold | | scenes/a.js |", "| 3–6 | That cat | knocks over a cup | fast push | | scenes/a.js |"]

    def lint(self, lock, rows=None):
        return SL.lint(lock + self.HEAD + "\n".join(rows or self.ROWS) + "\n")

    def red(self, res):
        return {(t, w) for lv, t, w, _ in res["table"] if lv == SL.RED} | {(t, w) for r in res["rows"] for lv, t, w, _ in r["issues"] if lv == SL.RED}

    def test_lock_ok(self):
        res = self.lint(self.LOCK)
        self.assertNotIn("⑫style lock", {t for t, _ in self.red(res)}, "\n".join(SL.report(res)))
        self.assertFalse([t for t, _ in self.red(res) if t.startswith(("⑫", "⑬", "⑭"))])

    def test_missing_lock_is_red(self):
        res = self.lint("Style: paper illustration\n\n")
        whats = [w for t, w in self.red(res) if t == "⑫style lock"]
        self.assertTrue(whats and "Palette" in whats[0] and "Character" in whats[0], whats)

    def test_blue_purple_palette(self):
        res = self.lint("Style: flat illustration\nPalette: #0E0631 #2A1A6E #F9FCFB\nCharacter: none\n\n")
        self.assertIn("⑬palette", {t for t, _ in self.red(res)})
        res = self.lint("Style: cyberpunk\nPalette: #2A1A6E #FF3EA5 #0B0B12\nCharacter: none\nAllow blue-purple: the user explicitly asked for cyberpunk purple\n\n")
        self.assertNotIn("⑬palette", {t for t, _ in self.red(res)})
        res = self.lint("Style: flat navy\nPalette: #0D1B2A #16293D #EEF3F6 #5CC8E0\nCharacter: none\n\n")   # navy hue is about 210°, not counted
        self.assertNotIn("⑬palette", {t for t, _ in self.red(res)})

    def test_code_drawn_character(self):
        res = self.lint("Style: flat illustration\nPalette: paper\nCharacter: code-drawn chibi little figure\n\n")
        self.assertIn("⑭character", {t for t, _ in self.red(res)})
        rows = ["| 0–3 | A white-shell robot | waves hello | hold | | scenes/a.js |", "| 3–6 | That cat | knocks over a cup | fast push | | scenes/a.js |"]
        self.assertIn("⑭character", {t for t, _ in self.red(self.lint(self.LOCK, rows))})
        self.assertNotIn("⑭character", {t for t, _ in self.red(self.lint("Style: picture book\nPalette: paper\nCharacter: frame library characters/xiaoman/\n\n", rows))})
        rows = ["| 0–3 | Xiaoman | tears open the bread bag | hold | | y4 clip shot01.json |", "| 3–6 | That cat | knocks over a cup | fast push | | scenes/a.js |"]
        self.assertIn("⑭character", {t for t, _ in self.red(self.lint(self.LOCK, rows))})

    def test_faces_on_objects_warn(self):
        rows = ["| 0–3 | A coin with a smiling face | hops into a jar one after another | hold | | scenes/a.js |", "| 3–6 | That cat | knocks over a cup | fast push | | scenes/a.js |"]
        res = self.lint(self.LOCK, rows)
        self.assertIn("⑭character", {t for r in res["rows"] for lv, t, *_ in r["issues"] if lv == SL.YELLOW})

    def test_three_grammars_is_collage(self):
        rows = ["| 0–3 | A cat | jumps onto the table | hold | | y2 clip a.json |", "| 3–6 | That cat | knocks over a cup | fast push | | y5 clip b.json |",
                "| 6–9 | The cup | breaks in two | slam in | | t3 clip c.json |"]
        self.assertTrue(any(t == "method" and "3 clip grammars" in w for t, w in self.red(self.lint(self.LOCK, rows))))
        self.assertFalse(any(t == "method" for t, _ in self.red(self.lint(self.LOCK, rows[:2]))))


class CameraRhythm(unittest.TestCase):
    """Camera column: give and take after pushing in, few accents, "hold" can repeat (added after the 2026-10-12 Nobel short
    pushed in about 48 times in 102 seconds)."""
    HEAD = Rules.HEAD
    OBJ = ["A cat | jumps onto the table", "That cat | knocks over a cup", "The cup | breaks in two", "The shards | bounce onto the floor",
           "The cat's paw | swats the shards away", "The floor | reflects the cat's shadow"]

    def lint(self, cams):
        rows = [f"| {3 * i}–{3 * i + 3} | {self.OBJ[i % 6]} | {c} | | scenes/a.js |" for i, c in enumerate(cams)]
        return SL.lint(self.HEAD + "\n".join(rows) + "\n")

    def issues(self, res):
        return {t for r in res["rows"] for _, t, *_ in r["issues"]} | {t for _, t, *_ in res["table"]}

    def test_three_inward_in_a_row(self):
        self.assertIn("⑮push-in", self.issues(self.lint(["slow push", "fast push", "slam in", "hold", "pull out", "pan"])))
        self.assertNotIn("⑮push-in", self.issues(self.lint(["slow push", "pull out", "fast push", "hold", "slow push", "pan"])))

    def test_too_many_accents(self):
        self.assertIn("⑯accents", self.issues(self.lint(["fast push", "hold", "slam in", "pan", "fast push", "pull out"])))
        self.assertNotIn("⑯accents", self.issues(self.lint(["slow push", "hold", "slam in", "pan", "fast push", "pull out"])))

    def test_holds_can_repeat(self):
        self.assertNotIn("⑦camera", self.issues(self.lint(["hold", "hold", "hold", "slow push", "pull out", "pan"])))
        self.assertIn("⑦camera", self.issues(self.lint(["fast push", "fast push", "fast push", "pan", "pull out", "hold"])))
        self.assertNotIn("⑦camera", self.issues(self.lint(["pan", "pan", "pan", "slow push", "pull out", "hold"])))   # panning piece by piece across an investigation desk

    def test_inward_synonyms(self):
        self.assertIn("⑮push-in", self.issues(self.lint(["push in", "dolly in", "zoom in", "hold", "pull out", "pan"])))


if __name__ == "__main__":
    unittest.main()
