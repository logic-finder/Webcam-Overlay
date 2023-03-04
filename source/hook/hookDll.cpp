#include <iostream>
#include <bitset>
#include <Windows.h>
#include <strsafe.h>
#include "hookDll.h"

LRESULT CALLBACK mouseHookProcedure(
	_In_ int	behaviorCode,
	_In_ WPARAM mouseEventType,
	_In_ LPARAM _mouseDataPointer
) {
	MOUSEHOOKSTRUCT* mouseDataPointer = (MOUSEHOOKSTRUCT*) _mouseDataPointer;
	HWND foregroundWindowHandle = GetForegroundWindow();

	if (behaviorCode != 0) goto hookEnd;

	switch (mouseEventType) {
		case WM_LBUTTONDOWN: {
			// 8 + 32 + 32 = 72
			std::bitset<8> signalType(MOUSE_CLICK_HAPPEN);
			std::bitset<32> mouseX(mouseDataPointer -> pt.x);
			std::bitset<32> mouseY(mouseDataPointer -> pt.y);
			std::cout << signalType << mouseX << mouseY << std::flush;
			goto sendWindowTitle;
		}

		case WM_MOUSEMOVE: {
			// 8 + 32 + 32 = 72
			std::bitset<8> signalType(MOUSE_MOVE_HAPPEN);
			std::bitset<32> mouseX(mouseDataPointer->pt.x);
			std::bitset<32> mouseY(mouseDataPointer->pt.y);
			std::cout << signalType << mouseX << mouseY << std::flush;
			goto hookEnd;
		}

		default:
		goto hookEnd;
	}

	sendWindowTitle:
	if (foregroundWindowHandle) {
		// +1 for null terminated character.
		const int windowTitleLength = 1 + GetWindowTextLengthW(foregroundWindowHandle);
		WCHAR* windowTitle = (WCHAR*) malloc(windowTitleLength * sizeof(int));

		// 8 + 32 + titleLength
		GetWindowTextW(foregroundWindowHandle, windowTitle, windowTitleLength);
		std::bitset<8> signalType(CURRENT_WINDOW_TITLE);
		std::bitset<32> titleLength(windowTitleLength);
		std::wcout << signalType << titleLength << windowTitle << std::flush;
	}
	else {
		std::bitset<8> signalType(CURRENT_WINDOW_TITLE);
		std::bitset<32> titleLength(22);
		std::wcout << signalType << titleLength << L"No foreground window." << std::flush;
	}

	hookEnd:
	return CallNextHookEx(mouseHooker.id,
		behaviorCode, mouseEventType, _mouseDataPointer);
}

LRESULT CALLBACK keyboardHookProcedure(
	_In_ int	behaviorCode,
	_In_ WPARAM keyboardEventType,
	_In_ LPARAM _keyboardDataPointer
) {
	KBDLLHOOKSTRUCT* keyboardDataPointer	= (KBDLLHOOKSTRUCT*) _keyboardDataPointer;
	DWORD virtualKeyCode					= keyboardDataPointer -> vkCode;

	if (behaviorCode != 0)					goto hookEnd;
	if (keyboardEventType != WM_KEYDOWN)	goto hookEnd;

	switch (virtualKeyCode) {
		case VK_ESCAPE:
		case VK_F1:
		case VK_F2:
		case VK_F3:
		case VK_F4:
		case VK_F5:
		case VK_F6: {
			// 8 + 8 = 16
			std::bitset<8> signalType(KEYBOARD_DOWN_HAPPEN);
			std::bitset<8> keyCode(virtualKeyCode);
			std::cout << signalType << keyCode << std::flush;
			break;
		}

		default:
			goto hookEnd;
	}

	hookEnd:
	return CallNextHookEx(keyboardHooker.id,
		behaviorCode, keyboardEventType, _keyboardDataPointer);
}

void installGlobalHook(Hooker hooker, int type, HOOKPROC func, HINSTANCE dllHandle) {
	hooker.type = type;
	hooker.func = func;
	hooker.id	= SetWindowsHookEx(
		hooker.type,
		hooker.func,
		dllHandle,
		0);
}

__declspec(dllexport) void __stdcall installHooks() {
	// Unicode setting
	std::locale::global(std::locale("ko_KR.utf8"));
	std::wcout.imbue(std::locale());

	// Get dll handle and install hooks
	HINSTANCE dllHandle;

	GetModuleHandleExW(
		GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
		L"dllTest.dll", &dllHandle);
	installGlobalHook(mouseHooker, WH_MOUSE_LL, mouseHookProcedure, dllHandle);
	installGlobalHook(keyboardHooker, WH_KEYBOARD_LL, keyboardHookProcedure, dllHandle);

	// 8 + 32 + 32 = 72
	std::bitset<8> signalType(HOOK_INSTALLED);
	std::bitset<32> screenX(GetSystemMetrics(SM_CXSCREEN));
	std::bitset<32> screenY(GetSystemMetrics(SM_CYSCREEN));
	std::cout << signalType << screenX << screenY << std::flush;
}

__declspec(dllexport) int __stdcall removeHooks() {
	UnhookWindowsHookEx(mouseHooker.id);
	UnhookWindowsHookEx(keyboardHooker.id);

	return 0;
}