# Webcam Overlay
## Developer
- Cor (logicseeker@naver.com)
- A reason I made this program: for personal use
- Problems I encountered while developing this program: https://youtu.be/E6TygVYmLz4
## Important Notification!
This program is written by a person whose knowledge is not broad on computers and programmings. **It is not predictable what bad effects may appear.** Therefore, it is recommended to use this program with care.
## Features
1. Overlaid webcam and animated mouse cursor
    - Therefore it is possible to use this program while using other programs.
2. Simple drawings
## How to execute this program?
※ It is supposed that Visual Studio and Node.js are already installed.
1. Clone this repository.
2. Change directory to that folder.
3. Run `npm install` to install Electron.js.
4. Open Visual Studio and build .dll and .exe.
5. Locate the built files under the source directory.
6. Run `npm start` to execute this program.
## Technologies used
1. **Windows API** (a.k.a. win32) for mouse and keyboard hooking and getting the monitor size.
2. **Electron.js** & **Node.js** for making a desktop application.
## Resources used
- icons: I drew them with mspaint.
- sound effects: created in https://sfxr.me/.
## Languages used
C++ for win32, JavaScript for Electron and Node.
## Development Environment
- Operating System: Windows 11
- .dll, .exe build: Visual Studio 2019
- Electron: version 22.0.3
- Node: As far as I know, a specific version of Node is included in Electron itself.
## Helpful materials I looked
in order to implement this program:
- MSDN documents about
  - C++ win32 development with Visual Studio
  - Data types used in win32
  - Hook
  - Dynamic-linked library
- Electron official documentation
- Node.js
  - child_process.spawn()
- Numerous internet search
  - stack overflow Q/As
  - blogs
## License
MIT