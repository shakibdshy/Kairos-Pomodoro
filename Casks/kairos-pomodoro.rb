cask "kairos-pomodoro" do
  version "1.7.0"
  sha256 "c60197fb71cacaaa7a5a6acf04d9967afb1d4c909c5cfd6eddd36d6400de0fea"

  url "https://github.com/shakibdshy/Kairos-Pomodoro/releases/download/v#{version}/Kairos-Pomodoro_#{version}_aarch64.dmg",
      verified: "github.com/shakibdshy/Kairos-Pomodoro/"
  name "Kairos-Pomodoro"
  desc "Local-first Pomodoro timer, task manager, and focus tracker"
  homepage "https://github.com/shakibdshy/Kairos-Pomodoro"

  livecheck do
    url :url
    strategy :github_latest
  end

  auto_updates true
  depends_on arch: :arm64
  depends_on :macos

  app "Kairos-Pomodoro.app"

  zap trash: [
    "~/Library/Application Support/com.kairos.pomodoro.app",
    "~/Library/Caches/com.kairos.pomodoro.app",
    "~/Library/Preferences/com.kairos.pomodoro.app.plist",
    "~/Library/Saved Application State/com.kairos.pomodoro.app.savedState",
  ]
end
