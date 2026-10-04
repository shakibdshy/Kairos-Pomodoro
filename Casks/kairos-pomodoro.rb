cask "kairos-pomodoro" do
  version "1.5.0"
  sha256 arm: "d9a533c8103008224ba61b782ed4b29600fbc0e0dc3fea4709b665a4e23231e7"

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

  app "Kairos-Pomodoro.app"

  zap trash: [
    "~/Library/Application Support/com.kairos.pomodoro.app",
    "~/Library/Caches/com.kairos.pomodoro.app",
    "~/Library/Preferences/com.kairos.pomodoro.app.plist",
    "~/Library/Saved Application State/com.kairos.pomodoro.app.savedState",
  ]
end
