#include <iostream>
#include <bitset>
#include <Windows.h>
#include "hookDll.h"

#pragma comment(lib, "user32.lib")

LRESULT CALLBACK mainWindowProcedure(HWND, UINT, WPARAM, LPARAM);

int WINAPI wWinMain(
	_In_		HINSTANCE	instanceHandle,
	_In_opt_	HINSTANCE	__legacy_hPrevInstance__,
	_In_		PWSTR		cmdLineArgument,
	_In_		int			windowFlag
) {
	const WCHAR className[] = L"MainWindow";
	const WCHAR windowTitle[] = L"Hooker";
	WNDCLASS windowClass = {};
	HWND mainWindowHandle;

	windowClass.lpfnWndProc = mainWindowProcedure;
	windowClass.hInstance = instanceHandle;
	windowClass.lpszClassName = className;

	RegisterClass(&windowClass);

	mainWindowHandle = CreateWindowExW(
		0,
		className,
		windowTitle,
		WS_OVERLAPPEDWINDOW,
		0, 0, 0, 0,
		NULL,
		NULL,
		instanceHandle,
		NULL);

	if (mainWindowHandle == NULL) {
		std::bitset<8> signalType(FAILED_WINDOW_CREATION);
		std::cout << signalType << std::flush;
		return 0;
	}

	std::bitset<8> signalType(SUCCESS_WINDOW_CREATION);
	std::cout << signalType << std::flush;

	// Message loop
	MSG msg = {};

	while (GetMessage(&msg, NULL, 0, 0) > 0) {
		DispatchMessage(&msg);
	}

	return removeHooks();
}

LRESULT CALLBACK mainWindowProcedure(
	HWND	windowHandle,
	UINT	msg,
	WPARAM	msgData1,
	LPARAM	msgData2
) {
	switch (msg) {
		case WM_CREATE:
			installHooks();
			break;
	}

	return DefWindowProc(windowHandle, msg, msgData1, msgData2);
}