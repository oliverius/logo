---
layout: page
title: [16]
permalink: /part16/
---

# still work in progress!

## Parser testing with events

There is another benefit of using events with the parser, and that's that we can test what the parser is doing instead of relying in looking at the screen.

For example, for our typical square `repeat 4 [fd 60 rt 90]` the parser will emit 8 events:

`fd 60` `rt 90` `fd 60` `rt 90` `fd 60` `rt 90` `fd 60` `rt 90`

which is very easy to test and will be always the same events for that script.

In the final version of the code I did those tests tweaking the method `parse()` in the parser to avoid using the clock since the use of the clock was mostly to avoid endless loops blocking everything. Because we won't be testing endless loops recursively anyway we don't need to worry.

Note (just in case) that you won't really see values like `fd 60` but `1`, `60` because `1` is the value in the enum for the `forward` primitive, so instead of:

`fd 60` `rt 90` `fd 60` `rt 90` `fd 60` `rt 90` `fd 60` `rt 90`

we will emit:

`1 60` `2 90` `1 60` `2 90` `1 60` `2 90` `1 60` `2 90`



