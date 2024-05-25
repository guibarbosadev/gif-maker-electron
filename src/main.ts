import { app, BrowserWindow, desktopCapturer } from "electron";
import path from "path";
import fs from "fs";
import os from "os";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  const mainWindow = createWindow();

  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      fetchWindowIcons: true,
      thumbnailSize: { width: 1500, height: 1000 },
    });
    const [firstScreen] = sources ?? [];

    const desktopPath = path.join(os.homedir(), "Desktop");
    const screenshotPath = path.join(
      desktopPath,
      `Screenshot-${Date.now()}.png`
    );

    fs.writeFile(screenshotPath, firstScreen.thumbnail.toPNG(), (error) => {
      if (error) return console.log("Error: ", error);
    });
  } catch (error) {
    // TODO: handle error
    console.log("Oops..error: ", error);
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
