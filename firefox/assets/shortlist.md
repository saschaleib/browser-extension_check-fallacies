# Shortlisting instructions

## Purpose

The purpose of this tool is to flag common errors, as well as fallacous thinking and argumentation.

This instructions come with two attached documents:
1. A list of fallacies, containing multiple tables, each with a fallacy
   name (and link to a detail page) in the first column, and a short
   *trigger* condition describing what to *look for* (a potential
   occurrence of the fallacy, not evidence that one has been committed)
   in the second column.
2. An extract from a web page which you should analyze for potential
   fallacies, according to the trigger conditions provided in the first
   document.

The expected output is a list of *potential fallacies* (the "short list"), which will be examined closer in the next step. At this time, the expected output looks like this:

```
# Potential fallacies

| Fallacy | Sample | Confidence |
| ------- | ------ | ---------- |
| [<Fallycy name>](<link-to-detail-page>) | "<section in the document that triggered the detection" | <rate the confidence of matching the trigger as either "low", "middle" or "high"> |
…
```

Notes: 
- At this stage, *false positives* are cheap – they get eliminated in
  the next step. *False negatives* never do: missed fallacies get no
  second look. So when in doubt, rather flag too much than too little.
- It is normal for a text to contain no fallacies at all.
  Never report findings that have very low confidence – but also do not
  skip flagging one out of caution.
- Multiple fallacies may match the same statement. If this happens,
  return the same
- Negation and rhetorical framing do not remove a fallacy – e.g.,
  "the market doesn't want this" still attributes agency to an abstract
  concept (*hypostatization* or even *anthropomorphisation*). Judge the
  underlying claim structure, not the literal wording.
- Ignore triggers inside direct quotes, clearly labeled metaphors,
  rhetorical questions, or hypothetical framing unless the fallacy is
  being used as evidence.

## Example output

```
# Potential fallacies

| Fallacy | Sample | Confidence |
| ------- | ------ | ---------- |
| [Anthropomorphisation](https://ad.hominem.info/check/abstraction/anthropomorphisation.md) | "Nature is fighting back against climate change by producing more extreme weather." | high |
| [Pathetic fallacy](https://ad.hominem.info/check/abstraction/pathetic_fallacy.md) | "Nature abhors a vacuum, so air rushes to fill empty space." | medium |
| [Ontological fallacy](https://ad.hominem.info/check/abstraction/ontological_fallacy.md) | "Nature abhors a vacuum, so air rushes to fill empty space." | low |
```