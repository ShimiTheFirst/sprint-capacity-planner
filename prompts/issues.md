# Encountered issues

- The model was repeatedly trying to use older, unsupported version of shadcn CLI. Each time I had to run that only to get CLI message based on which the model finally realized it needs to use the latest version of shadcn CLI. After few attempts of trying to explain I gave up and started running the CLI manually.
- For some reason, the model was escaping ' characters in some of the generated files. This obviously broke everything because it’s not valid JS/TS, but was easy to point out and fix.
- After few steps of the rather large init instructions, the model started to get really slow at summarizing chat history (for itself) which it does before each next step.
- Probably as a next step of the same issue, the model started loosing context which lead to
  - generating @/ imports instead of ~/ as explained in the beginning,
  - escaping ' again,
  - using `sprint.id` instead of `sprint.sprintId` which it set in previous steps,
  - adding unnecessary imports which looked like it was not aware of the already implemented solution of the same logic in another file
  until finally I got VS Code error about Gemini failing to connect and even though the chat was still open and included all the previous context, the model behaved like it’s starting from scratch.
- I had to re-paste the initial instructions. The model felt different but was able to decide next steps on its own and continue.
- Even after this reset few prompts ended with an error and had to be re-run.
- At the end of 1st phase, there were some bugs
  - using deprecated prop on Next Link component
  - using Separators inside sprint team members list in a way that the separators wre part of the member card, not between
  - console errors
  - loading state flashing on each sprint action
  