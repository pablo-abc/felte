---
section: Multi page forms
---

## Multi page forms

[Where possible, long forms should be divided into multiple smaller forms that constitute a series of logical steps or stages](https://www.w3.org/WAI/tutorials/forms/multi-page/). If you were building something like this on a traditional server-side rendered site, the most logical thing to do would be to have a separate, distinct form for each step. The submit action of each step would do something with the current data and go to the next step. If you want to keep your forms in a way that would make them work without JS, this is the way you will need to do it with Felte as well. Here we will outline a possible solution on how to handle this that might serve as inspiration for your own solution.

> **TODO**: A proper example for this needs to be made
