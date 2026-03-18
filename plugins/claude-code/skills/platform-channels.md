---
name: platform-channels
description: Complete guide for Flutter platform channels to communicate with native code (Swift/Kotlin) and JavaScript, including MethodChannel, EventChannel, BasicMessageChannel, and FFI
origin: Flutter Dev Assistant
---

# Platform Channels - Native Integration

Channel types: `MethodChannel` (request/response), `EventChannel` (streaming), `BasicMessageChannel` (binary).

## MethodChannel - iOS (Swift)

### Flutter Side

```dart
// lib/services/battery_service.dart
import 'package:flutter/services.dart';

class BatteryService {
  static const platform = MethodChannel('com.example.app/battery');
  
  Future<int> getBatteryLevel() async {
    try {
      final int result = await platform.invokeMethod('getBatteryLevel');
      return result;
    } on PlatformException catch (e) {
      throw 'Failed to get battery level: ${e.message}';
    }
  }
  
  Future<void> showNativeAlert(String title, String message) async {
    try {
      await platform.invokeMethod('showAlert', {
        'title': title,
        'message': message,
      });
    } on PlatformException catch (e) {
      throw 'Failed to show alert: ${e.message}';
    }
  }
}
```

### iOS Side (Swift)

```swift
// ios/Runner/AppDelegate.swift
import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let controller : FlutterViewController = window?.rootViewController as! FlutterViewController
    
    let batteryChannel = FlutterMethodChannel(
      name: "com.example.app/battery",
      binaryMessenger: controller.binaryMessenger
    )
    
    batteryChannel.setMethodCallHandler({
      [weak self] (call: FlutterMethodCall, result: @escaping FlutterResult) -> Void in
      
      switch call.method {
      case "getBatteryLevel":
        self?.getBatteryLevel(result: result)
        
      case "showAlert":
        guard let args = call.arguments as? [String: Any],
              let title = args["title"] as? String,
              let message = args["message"] as? String else {
          result(FlutterError(code: "INVALID_ARGUMENTS",
                            message: "Invalid arguments",
                            details: nil))
          return
        }
        self?.showAlert(title: title, message: message, result: result)
        
      default:
        result(FlutterMethodNotImplemented)
      }
    })
    
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  private func getBatteryLevel(result: FlutterResult) {
    let device = UIDevice.current
    device.isBatteryMonitoringEnabled = true
    
    if device.batteryState == .unknown {
      result(FlutterError(code: "UNAVAILABLE",
                        message: "Battery level not available",
                        details: nil))
    } else {
      let batteryLevel = Int(device.batteryLevel * 100)
      result(batteryLevel)
    }
  }
  
  private func showAlert(title: String, message: String, result: @escaping FlutterResult) {
    DispatchQueue.main.async {
      let alert = UIAlertController(
        title: title,
        message: message,
        preferredStyle: .alert
      )
      
      alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
        result(nil)
      })
      
      if let viewController = UIApplication.shared.keyWindow?.rootViewController {
        viewController.present(alert, animated: true)
      }
    }
  }
}
```

## MethodChannel - Android (Kotlin)

```kotlin
// android/app/src/main/kotlin/com/example/app/MainActivity.kt
package com.example.app

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example.app/battery"

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
            call, result ->
            
            when (call.method) {
                "getBatteryLevel" -> {
                    val batteryLevel = getBatteryLevel()
                    
                    if (batteryLevel != -1) {
                        result.success(batteryLevel)
                    } else {
                        result.error("UNAVAILABLE", "Battery level not available", null)
                    }
                }
                
                "showAlert" -> {
                    val title = call.argument<String>("title")
                    val message = call.argument<String>("message")
                    
                    if (title != null && message != null) {
                        showAlert(title, message)
                        result.success(null)
                    } else {
                        result.error("INVALID_ARGUMENTS", "Invalid arguments", null)
                    }
                }
                
                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    private fun getBatteryLevel(): Int {
        val batteryLevel: Int
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        } else {
            val intent = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { ifilter ->
                registerReceiver(null, ifilter)
            }
            batteryLevel = intent?.let { intent ->
                val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                (level * 100 / scale.toFloat()).toInt()
            } ?: -1
        }
        return batteryLevel
    }
    
    private fun showAlert(title: String, message: String) {
        runOnUiThread {
            android.app.AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton("OK", null)
                .show()
        }
    }
}
```

## EventChannel - Streaming Data

### Flutter Side

```dart
// lib/services/sensor_service.dart
import 'package:flutter/services.dart';

class SensorService {
  static const eventChannel = EventChannel('com.example.app/sensors');
  
  Stream<Map<String, double>>? _accelerometerStream;
  
  Stream<Map<String, double>> get accelerometerStream {
    _accelerometerStream ??= eventChannel
        .receiveBroadcastStream()
        .map((dynamic event) => Map<String, double>.from(event));
    return _accelerometerStream!;
  }
}

```

### iOS Side (Swift)

```swift
// ios/Runner/AppDelegate.swift
import CoreMotion

class AccelerometerStreamHandler: NSObject, FlutterStreamHandler {
  private var eventSink: FlutterEventSink?
  private let motionManager = CMMotionManager()
  
  func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink) -> FlutterError? {
    self.eventSink = events
    
    if motionManager.isAccelerometerAvailable {
      motionManager.accelerometerUpdateInterval = 0.1
      motionManager.startAccelerometerUpdates(to: .main) { [weak self] (data, error) in
        guard let data = data, let eventSink = self?.eventSink else { return }
        
        eventSink([
          "x": data.acceleration.x,
          "y": data.acceleration.y,
          "z": data.acceleration.z
        ])
      }
    }
    
    return nil
  }
  
  func onCancel(withArguments arguments: Any?) -> FlutterError? {
    motionManager.stopAccelerometerUpdates()
    eventSink = nil
    return nil
  }
}

// In AppDelegate
override func application(...) -> Bool {
  let controller = window?.rootViewController as! FlutterViewController
  
  let sensorChannel = FlutterEventChannel(
    name: "com.example.app/sensors",
    binaryMessenger: controller.binaryMessenger
  )
  
  sensorChannel.setStreamHandler(AccelerometerStreamHandler())
  
  return super.application(application, didFinishLaunchingWithOptions: launchOptions)
}
```

### Android Side (Kotlin)

```kotlin
// android/app/src/main/kotlin/com/example/app/MainActivity.kt
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import io.flutter.plugin.common.EventChannel

class AccelerometerStreamHandler(private val context: Context) : EventChannel.StreamHandler {
    private var sensorManager: SensorManager? = null
    private var sensor: Sensor? = null
    private var eventSink: EventChannel.EventSink? = null
    
    private val sensorEventListener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            val data = mapOf(
                "x" to event.values[0].toDouble(),
                "y" to event.values[1].toDouble(),
                "z" to event.values[2].toDouble()
            )
            eventSink?.success(data)
        }
        
        override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
    }
    
    override fun onListen(arguments: Any?, events: EventChannel.EventSink) {
        eventSink = events
        sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        sensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        
        sensor?.let {
            sensorManager?.registerListener(
                sensorEventListener,
                it,
                SensorManager.SENSOR_DELAY_NORMAL
            )
        }
    }
    
    override fun onCancel(arguments: Any?) {
        sensorManager?.unregisterListener(sensorEventListener)
        eventSink = null
    }
}

// In MainActivity
override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
    super.configureFlutterEngine(flutterEngine)
    
    EventChannel(flutterEngine.dartExecutor.binaryMessenger, "com.example.app/sensors")
        .setStreamHandler(AccelerometerStreamHandler(this))
}
```

## Creating a Plugin Package

```
my_plugin/
├── android/src/main/kotlin/com/example/my_plugin/MyPlugin.kt
├── ios/Classes/MyPlugin.swift
├── lib/
│   ├── my_plugin.dart
│   ├── my_plugin_platform_interface.dart
│   └── my_plugin_method_channel.dart
├── example/lib/main.dart
└── pubspec.yaml
```

```dart
// lib/my_plugin_platform_interface.dart
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'my_plugin_method_channel.dart';

abstract class MyPluginPlatform extends PlatformInterface {
  MyPluginPlatform() : super(token: _token);

  static final Object _token = Object();
  static MyPluginPlatform _instance = MethodChannelMyPlugin();

  static MyPluginPlatform get instance => _instance;

  static set instance(MyPluginPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<String?> getPlatformVersion() {
    throw UnimplementedError('getPlatformVersion() has not been implemented.');
  }
}
```

```dart
// lib/my_plugin_method_channel.dart
import 'package:flutter/services.dart';
import 'my_plugin_platform_interface.dart';

class MethodChannelMyPlugin extends MyPluginPlatform {
  final methodChannel = const MethodChannel('my_plugin');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>('getPlatformVersion');
    return version;
  }
}
```

```dart
// lib/my_plugin.dart
import 'my_plugin_platform_interface.dart';

class MyPlugin {
  Future<String?> getPlatformVersion() {
    return MyPluginPlatform.instance.getPlatformVersion();
  }
}
```

## JavaScript Interop (Web)

### Using js_interop (Recommended)

```dart
// lib/services/local_storage_service.dart
import 'dart:js_interop';

@JS('localStorage')
external LocalStorage get localStorage;

@JS()
@staticInterop
class LocalStorage {}

extension LocalStorageExtension on LocalStorage {
  external void setItem(String key, String value);
  external String? getItem(String key);
  external void removeItem(String key);
  external void clear();
}

```

### Custom JavaScript Integration

```html
<!-- web/index.html -->
<!DOCTYPE html>
<html>
<head>
  <script>
    // Custom JavaScript functions
    window.myCustomFunction = function(message) {
      console.log('Message from Flutter:', message);
      return 'Response from JavaScript';
    };
    
    window.getDeviceInfo = function() {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      };
    };
  </script>
</head>
<body>
  <script src="main.dart.js"></script>
</body>
</html>
```

```dart
// Dart side: call window functions via dart:js
import 'dart:js' as js;

final result = js.context.callMethod('myCustomFunction', ['hello']) as String;
final info = js.context.callMethod('getDeviceInfo', []);
```

## FFI (Foreign Function Interface)

### For C/C++ Libraries

```dart
// lib/services/native_lib.dart
import 'dart:ffi' as ffi;
import 'dart:io';

// C function signature
typedef NativeAddFunc = ffi.Int32 Function(ffi.Int32 a, ffi.Int32 b);
typedef AddFunc = int Function(int a, int b);

class NativeLib {
  late final ffi.DynamicLibrary _dylib;
  late final AddFunc _add;
  
  NativeLib() {
    // Load the dynamic library
    if (Platform.isAndroid) {
      _dylib = ffi.DynamicLibrary.open('libnative_lib.so');
    } else if (Platform.isIOS) {
      _dylib = ffi.DynamicLibrary.process();
    } else {
      throw UnsupportedError('Platform not supported');
    }
    
    // Look up the function
    _add = _dylib
        .lookup<ffi.NativeFunction<NativeAddFunc>>('native_add')
        .asFunction();
  }
  
  int add(int a, int b) {
    return _add(a, b);
  }
}
```

## Error Handling

```dart
class PlatformService {
  static const platform = MethodChannel('com.example.app/service');
  
  Future<T> invokeMethod<T>(String method, [dynamic arguments]) async {
    try {
      final result = await platform.invokeMethod<T>(method, arguments);
      return result!;
    } on PlatformException catch (e) {
      throw PlatformServiceException(
        code: e.code,
        message: e.message ?? 'Unknown error',
        details: e.details,
      );
    } catch (e) {
      throw PlatformServiceException(
        code: 'UNKNOWN',
        message: e.toString(),
      );
    }
  }
}

class PlatformServiceException implements Exception {
  final String code;
  final String message;
  final dynamic details;
  
  PlatformServiceException({
    required this.code,
    required this.message,
    this.details,
  });
  
  @override
  String toString() => 'PlatformServiceException($code): $message';
}
```

## Testing Platform Channels

```dart
// test/services/battery_service_test.dart
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const channel = MethodChannel('com.example.app/battery');
  
  TestWidgetsFlutterBinding.ensureInitialized();
  
  setUp(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
      if (methodCall.method == 'getBatteryLevel') {
        return 85;
      }
      return null;
    });
  });
  
  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, null);
  });
  
  test('getBatteryLevel returns battery level', () async {
    final service = BatteryService();
    final level = await service.getBatteryLevel();
    expect(level, 85);
  });
}
```

