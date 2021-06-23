# 3dminigolf (Arcade API)
## What is it?
This is an attempt to create 3D minigolf in the arcade API. The arcade API runs in JavaScript or lua, but this project uses JavaScript.
## What does it contain?
The system loosely relies on GameBase, a module I created to help with creating things within the API. GameBase was originally written in lua and ported in a rush, making it clunky to work with in JS. 

Aside from that, this project implements:
- Basic implementations of **Vector**, **Angle** and **Matrix** for working in 3D.
- Custom 3D renderer, relying on the built-in draw quadrilateral function of the API to render to screen.
- Custom physics engine, for semi-reliable ball-on-world collisions. 
- Model importing using the _.ply_ format.
## How do I play?
1. Download the Arcade API from [here](https://forums.pixeltailgames.com/t/arcade-tool-for-people-who-want-to-mess-with-it/23715?u=botdan). Download the one that supports JavaScript at the bottom of the post, otherwise this won't work.
2. Unpack the folder and save it somewhere
3. Create a new folder inside the `projects` folder called `3dport`.
4. Place the contents of this repository into the `gamebase` folder. You should have a file structure like so: `PATH_TO_ARCADE/projects/3dport/main.js`
5. Open a command prompt inside the arcade api root folder (where you can see the `projects` folder and `tool.exe`)
6. Type `tool 3dport`.
And voila, you're done. You can open the console using `¬`.
