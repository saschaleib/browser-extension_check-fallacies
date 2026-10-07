# Web Browser Extension: Check Fallacies

A browser extension that uses AI to check a page content for typical
*fallacies* and related issues

This is part of an experiment to use AI for checking text (articles, speeches,
posts, etc.) for typical fallacies and related errors in thinking and argumentation.
You can find more information (including the AI instructions) on my web site:
[Ad Hominem Info](https://ad.hominem.info/check/).

**Notes:**
- This is a “bring your own AI” tool – configure your local (Ollama, LM Studio,
  etc.) AI, or link it to your external provider (limited support so far).
  This extension does *not* come with its own AI.
- This is a *work in progress* and currently only really useful if your setup
  is somewhat similar to what I have. See below for information on how to use it.
- This is no *fact-checking* or *validation* tool. It checks for signs of typical
  errors in thinking. If these are flagged, it is probably a good idea to double
  check your thinking, or be critical of the author. It does not mean that the
  fallacy is guaranteed. If there are no fallacies found, it also doesn't mean
  that the claims are correct or free of fallacies, it just means that the tool
	didn't *find* any with the limited scope of tests that it can perform.
- Different AI models have different approaches and different thresholds when to
  flag an issue. Try different models/providers to find one that works well
  for you. I consider this a feature, not a bug.

## Requirements

- Web browser: only *Firefox* is supported for now (others are planned)
- AI/LLM service: works well with local *LM Studio* and *Ollama,* and
  it *should* work with any service that uses the same API (most of them).
  Supporting other APIs is planned for future versions.

## Configuring the AI Provider

Before you can use the extension, you need to configure your AI provider in
the plugin options. Go to [about:addons](about:addons) (Firefox) and select 
the extension, then click on the "Check Fallacies" extension, and then on
"Preferences".

The options on this page are:

- **API type**: select which API variant the server uses. The available options
  here are "OpenAI compatible" (typically uses `/v1/` in the endpoint path),
  or "Ollama native" for Ollama and compatible systems (typically with `/api/`
  in the path).

- **API endpoint**: the server address to be used to call the AI. For example, 
  a local ML Studio uses `http://localhost:1234/v1/` by default. Ollama's
  default is `http://localhost:11434/api/`.    
  Please make sure that your server is running and able to accept incoming
	requests before using the extension. If the server is *not* running on
  the same machine, this usually requires some configuration first!

- **API key**: if your provider requires you to log in, or provided you with
  a token, this is the place to put it.    
  If you don't need it, you can simply leave this field empty.

- **Model**: enter the model identifyer here. For example `gemma-4-31B`.
  Hint: once the above settings are correct, you can click on the "Reload"
  button (`⟲`) to fetch a list of available models from the server.    
  Hint: this is also a "pre-test" for the settings, as it checks the server
  connection in a similar way as the "Test" button mentioned below.

Before you can save the settings, click on the "Test" button to see if the
connection and the model are actually accessible.

**Note:** The server will try to load the specified model into memory (VRAM)
and run a very simple request (an empty string) via the model.
Nevertheless, in order to do this, the server still will have to load the 
model into memory, which can take some time if it wasn't loaded already.
If this takes too long, or if there is not enough VRAM available, this may
*time out* or fail altogether.
Best make sure that the model is already loaded before you configure the 
extension.

**Note 2:** Don't forget to click on "Save" to save the settings.

## Data protection

The extension, and the provider of this tool, does not collect or retain any
information about its use, the users or any activities that are done with it.
It has been designed in a way that it *can* be used without 

In order to function, the extension has to fetch information from the backend
site [Ad Hominem Info](https://ad.hominem.info/check/). This site is configured
to be as data-protection friendly as possible: It does not track users and only
has very limited statistics abilities.
However, for technical reasons, each access to the site is logged in the
server's log files. This is used purely for technical analysis and not for
tracking or collecting information about its users.
For more information, see the [Imprint](https://ad.hominem.info/imprint.html)
page on that site.

Depending on which AI/LLM provider you chose, they may collect additional data.
Please see the privacy statement of your provider for more information.

If you use a local AI server (recommended!), nobody but yourself can track what
you are doing with it. If you use AI/LLM services a lot, this may also be the
cheapest option.

## How does it work?

This extension provides a new **sidebar panel** for your web browser, where all
the required tools reside. If you don't see the sidebar, you can also click on
the plugin button (possibly from the "Extensions" menu) to open the panel.
There is also a keyboard shortcut (`Ctrl`-`Shift`-`A`) for the same (this is
experimental, though, and may be changed in a later version).

Upon clicking on the **“Analyze”** button, the script attempts to extract the main
content of the current page. This extract is done be the
[Readability.js](https://github.com/mozilla/readability) library. The same that
Firefox uses to extract the main content for its “reader view”.

The extension then contacts your configured AI provider and sends this extract,
along with instructions how to analyse it. 

This request includes the instruction to load the **[List of Fallacies](https://ad.hominem.info/check/list.html)**
which contains broad triggers for each fallacy. From this, the AI should
generate a shortlist of *possible fallacies*, which should go into a second round
of examination.

For each fallacy, there is a **Detail page**, with more detailled information on how
to detect the fallacy, and also criteria when it is not actually fallacious.    
See e.g.:
[Accident fallacy](https://ad.hominem.info/check/generalization/accident_fallacy.html),
[Ontological fallacy](https://ad.hominem.info/check/abstraction/ontological_fallacy.html) and
[Whataboutism](https://ad.hominem.info/check/rhetoric/whataboutism.html).

From these the AI should generate a shortlisted **report** of the fallacies most likely 
present in the page. The report should also include a link to the human-readable 
long-form articles on [Fallacies Online](https://fallacies.online/), or if the request was
in German, then to the German versions on [Denkfehler Online](https://denkfehler.online/).

More information will be added here soon.
