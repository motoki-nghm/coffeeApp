import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";

const CoffeeTimer = () => {
  const [beanAmount, setBeanAmount] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const wakeLockRef = useRef(null);

  // 豆の量に応じた水の量を設定
  const waterAmounts =
    beanAmount === 20
      ? { total: 300, step1: 45, step2: 120, step3: 200, step4: 300 }
      : { total: 225, step1: 35, step2: 90, step3: 150, step4: 225 };

  // ステップの定義
  const steps = [
    {
      id: 1,
      time: 0,
      title: "蒸らし準備",
      description: `閉じた状態で90℃前後のお湯を${waterAmounts.step1}g、豆が浸る程度に注ぐ（浸漬）`,
      action: "注湯",
    },
    {
      id: 2,
      time: 40,
      title: "第1回透過",
      description: `開け、すぐ${waterAmounts.step2}gまで注ぐ（透過）`,
      action: "開け→注湯",
    },
    {
      id: 3,
      time: 90,
      title: "第2回透過",
      description: `${waterAmounts.step3}gまで注ぐ（透過）`,
      action: "注湯",
    },
    {
      id: 4,
      time: 130,
      title: "温度調整",
      description: `閉じ、湯温を70~80℃に下げてから${waterAmounts.step4}gまで注ぐ（浸漬）`,
      action: "閉じ→注湯",
    },
    {
      id: 5,
      time: 165,
      title: "最終透過",
      description: "開け、透過を待つ",
      action: "開く",
    },
    {
      id: 6,
      time: 210,
      title: "完成",
      description: "抽出完了！美味しいコーヒーをお楽しみください",
      action: "完成",
    },
  ]; // 現在のステップを取得
  const getCurrentStep = () => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (currentTime >= steps[i].time) {
        return i;
      }
    }
    return -1;
  };

  // Wake Lock API でスリープを防止
  const requestWakeLock = async () => {
    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.log("Wake Lock failed:", err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // タイマー制御
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime((time) => {
          const newTime = time + 1;
          // 3:30 (210秒) で自動停止
          if (newTime >= 210) {
            setIsRunning(false);
            return 210;
          }
          return newTime;
        });
      }, 1000);
      requestWakeLock();
    } else {
      clearInterval(interval);
      releaseWakeLock();
    }
    return () => {
      clearInterval(interval);
      releaseWakeLock();
    };
  }, [isRunning]);

  // 時間フォーマット
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsStarted(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setIsStarted(false);
    releaseWakeLock();
  };

  const currentStepIndex = getCurrentStep();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coffee className="w-8 h-8 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-900">コーヒータイマー</h1>
          </div>
        </div>

        {/* 豆の量選択 */}
        {!isStarted && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">豆の量を選択</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setBeanAmount(15)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  beanAmount === 15
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                15g
                <br />
                <span className="text-sm opacity-80">水: 225ml</span>
              </button>
              <button
                onClick={() => setBeanAmount(20)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  beanAmount === 20
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                20g
                <br />
                <span className="text-sm opacity-80">水: 300ml</span>
              </button>
            </div>
          </div>
        )}

        {/* タイマー表示 */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-lg text-center">
          <div className="text-5xl font-mono font-bold text-amber-900 mb-4">{formatTime(currentTime)}</div>

          {/* アニメーション用スペース */}
          <div className="h-20 flex items-center justify-center mb-6">
            {isRunning && currentTime < 210 && (
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                <Coffee className="w-6 h-6 text-amber-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            )}
            {(!isRunning || currentTime >= 210) && isStarted && (
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Coffee className={`w-8 h-8 ${currentTime >= 210 ? "text-green-600" : "text-amber-600"}`} />
              </div>
            )}
          </div>

          {/* コントロールボタン */}
          <div className="flex gap-4 justify-center">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                開始
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Pause className="w-5 h-5" />
                一時停止
              </button>
            )}
            <button
              onClick={resetTimer}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              リセット
            </button>
          </div>
        </div>

        {/* ステップ表示 */}
        <div className="relative">
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;

              // 完了したステップは非表示にする
              if (isCompleted) {
                return null;
              }

              return (
                <div
                  key={step.id}
                  className={`bg-white rounded-xl p-4 shadow-md transition-all duration-700 ease-in-out transform ${
                    isActive
                      ? "ring-2 ring-amber-400 bg-amber-50 translate-y-0 opacity-100 scale-105"
                      : "bg-gray-50 translate-y-0 opacity-70"
                  }`}
                  style={{
                    // 完了したステップの数だけ上に移動
                    transform: `translateY(-${currentStepIndex * 8}px) ${isActive ? "scale(1.05)" : "scale(1)"}`,
                    transitionDelay: "100ms",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                        isActive ? "bg-amber-500 text-white scale-110" : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            isPending ? "text-gray-400" : isActive ? "text-amber-700 font-semibold" : "text-gray-600"
                          }`}
                        >
                          {formatTime(step.time)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                            isActive ? "bg-amber-200 text-amber-800 scale-105" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {step.action}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold mb-1 transition-colors duration-300 ${
                          isPending ? "text-gray-400" : isActive ? "text-amber-900" : "text-gray-800"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          isPending ? "text-gray-300" : isActive ? "text-amber-700" : "text-gray-600"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 完了したステップ数の表示 */}
          {currentStepIndex > 0 && (
            <div
              className="mt-4 text-center transition-all duration-700"
              style={{ transform: `translateY(-${currentStepIndex * 8}px)` }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {currentStepIndex}つのステップが完了しました
              </div>
            </div>
          )}
        </div>

        {/* 完成時のメッセージ */}
        {currentTime >= 210 && (
          <div className="mt-6 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-2xl mb-2">🎉</div>
            <h2 className="text-xl font-bold mb-2">完成おめでとうございます！</h2>
            <p>美味しいコーヒーをお楽しみください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoffeeTimer;
