cask "kairos-pomodoro" do
  version "1.6.0"
  sha256 arm: "dcc677383008cb59565b2e2167edd44a3d3dc792e6745d4bb11543e81cef6587"

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
