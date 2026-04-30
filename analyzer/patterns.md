

patterns.py is the file that checks whether a password looks “too predictable.”

Big picture
- It does not calculate strength by math.
- It looks for patterns that humans often use and attackers guess easily.
- It returns a list of weakness labels.

## 1) Top comment
`"""Weakness pattern detection for educational password analysis."""`
- This is just the file description.
- It tells you this file checks weak patterns for learning/demo purposes.

---

## 2) `import re`
- `re` means regular expressions.
- Regular expressions are a way to search text using a pattern.
- Here it is used to detect repeated characters.

Simple example:
- normal search: look for exact word
- regex search: look for text patterns like “same character repeated 4 times”

---

## 3) `COMMON_SUBSTITUTIONS = {...}`

This is a dictionary of common “tricks” people use in passwords.

Examples:
- `@` means `a`
- `0` means `o`
- `1` means `i`
- `3` means `e`
- `4` means `a`
- `$` means `s`
- `5` means `s`
- `7` means `t`

Why:
- People often replace letters with symbols to make passwords look stronger.
- Attackers know these tricks, so the password may still be weak.

Example:
- `p@ssw0rd` becomes something like `password`
- That is why it is still a common pattern

---

## 4) `_has_sequence(password: str) -> bool`

Purpose:
- Checks if the password contains a simple sequence like:
  - `abcd`
  - `1234`

Why:
- Sequential patterns are easy to guess.

Line by line:

`lowered = password.lower()`
- Convert password to lowercase.
- This makes checking easier.
- Example: `ABCD` becomes `abcd`.

`sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789"]`
- These are the two sequence sources being checked:
  - alphabet order
  - number order

`for sequence in sequences:`
- Check each sequence type.

`for start in range(len(sequence) - 3):`
- Move through the sequence one step at a time.
- `- 3` is used because we want a 4-character fragment.

`fragment = sequence[start : start + 4]`
- Take 4 letters/numbers at a time.
- Example:
  - `abcd`
  - `bcde`
  - `cdef`

`if fragment in lowered:`
- If that 4-character fragment exists anywhere in the password, return True.

`return True`
- Means a sequence was found.

`return False`
- Means no sequence was found.

Example:
- password `abc123`
- contains `abc` and `123`, but this function looks for 4-char fragments.
- password `abcd1234`
- contains `abcd` and `1234`, so it returns True.

---

## 5) `_has_repetition(password: str) -> bool`

Purpose:
- Checks if one character repeats 4 or more times in a row.

Line by line:

`return bool(re.search(r"(.)\1{3,}", password))`

Breakdown:
- `re.search(...)` searches the password.
- Pattern `r"(.)\1{3,}"` means:
  - `(.)` = capture any single character
  - `\1` = the same character again
  - `{3,}` = repeat it 3 or more more times after the first one
- So total repeated count becomes 4 or more.

Examples:
- `aaaa` -> True
- `1111` -> True
- `abc` -> False
- `aaab` -> False because only 3 repeated, not 4

Why:
- Very long repeated characters are weak and predictable.

---

## 6) `_has_common_substitution(password: str) -> bool`

Purpose:
- Checks if password is basically a common word with simple substitutions.

Line by line:

`normalized = "".join(COMMON_SUBSTITUTIONS.get(char, char).lower() for char in password)`
- Go through each character.
- If it is in substitution map, replace it.
- If not, keep it as is.
- Convert result to lowercase.
- Example:
  - `p@ssw0rd` -> `password`

`patterns = ["password", "admin", "welcome", "qwerty", "letmein"]`
- These are common weak password words.

`return any(word in normalized for word in patterns)`
- If any of those words appear in the normalized password, return True.

Examples:
- `p@ssw0rd` -> normalized to `password` -> True
- `Adm1n123` -> normalized to `admin123` -> True
- `xk29$k` -> likely False

Why:
- A password may look clever, but if it is just a common word with substitutions, it is still weak.

---

## 7) `detect_weaknesses(password: str) -> list[str]`

Purpose:
- Main function that collects all weakness labels.

Line by line:

`weaknesses = []`
- Start with empty list.

`if _has_sequence(password):`
- If sequence found...
`weaknesses.append("Sequential pattern detected")`
- Add label.

`if _has_repetition(password):`
- If repeated character pattern found...
`weaknesses.append("Repeated characters detected")`
- Add label.

`if _has_common_substitution(password):`
- If common-word substitution found...
`weaknesses.append("Common substitutions detected")`
- Add label.

`return weaknesses`
- Return the final list.

Example outputs:
- password `abcd1234`
  - result: `["Sequential pattern detected"]`
- password `aaaa1111`
  - result: `["Repeated characters detected"]`
- password `p@ssw0rd`
  - result: `["Common substitutions detected"]`
- password `abc123aaaa`
  - result: possibly more than one label

---

## Very simple summary
This file checks 3 weakness types:
- sequence like `abcd` or `1234`
- repeated characters like `aaaa`
- common password words hidden by symbol tricks like `p@ssw0rd`

## In your app
- estimator.py calls `detect_weaknesses(password)`
- then those labels are shown as weakness info and used to build suggestions

