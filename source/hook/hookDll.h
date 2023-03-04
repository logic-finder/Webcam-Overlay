#define FAILED_WINDOW_CREATION	0
#define SUCCESS_WINDOW_CREATION 1
#define HOOK_INSTALLED			2
#define MOUSE_MOVE_HAPPEN		3
#define MOUSE_CLICK_HAPPEN		4
#define KEYBOARD_DOWN_HAPPEN	5
#define CURRENT_WINDOW_TITLE	6

struct Hooker {
	int			type;
	HOOKPROC	func;
	HHOOK		id;
};

struct Hooker mouseHooker;
struct Hooker keyboardHooker;

__declspec(dllexport) void __stdcall installHooks();
__declspec(dllexport) int __stdcall removeHooks();