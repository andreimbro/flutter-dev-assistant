---
name: iot-bluetooth
description: Bluetooth connectivity in Flutter including BLE (Bluetooth Low Energy) and Classic Bluetooth with practical examples and best practices
origin: Flutter Dev Assistant
---

# IoT - Bluetooth Connectivity

## Bluetooth Low Energy (BLE)

### Setup - flutter_blue_plus

```yaml
dependencies:
  flutter_blue_plus: ^1.32.0
  permission_handler: ^11.3.0
```

### Permissions

```xml
<!-- Android: android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
                 android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

```xml
<!-- iOS: ios/Runner/Info.plist -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app needs Bluetooth to connect to devices</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app needs Bluetooth to connect to devices</string>
```

### BLE Service with Riverpod

```dart
// lib/services/ble_service.dart
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'ble_service.g.dart';

@riverpod
class BleScanner extends _$BleScanner {
  @override
  List<ScanResult> build() {
    _startScanning();
    return [];
  }

  void _startScanning() {
    FlutterBluePlus.startScan(
      timeout: const Duration(seconds: 4),
      androidUsesFineLocation: false,
    );
    FlutterBluePlus.scanResults.listen((results) {
      state = results;
    });
  }

  Future<void> stopScanning() async {
    await FlutterBluePlus.stopScan();
  }
}

@riverpod
class BleConnection extends _$BleConnection {
  BluetoothDevice? _device;

  @override
  BluetoothConnectionState build(String deviceId) {
    return BluetoothConnectionState.disconnected;
  }

  Future<void> connect(BluetoothDevice device) async {
    try {
      _device = device;
      await device.connect(
        timeout: const Duration(seconds: 15),
        autoConnect: false,
      );
      device.connectionState.listen((connectionState) {
        state = connectionState;
      });
    } catch (e) {
      throw BleException('Failed to connect: $e');
    }
  }

  Future<void> disconnect() async {
    await _device?.disconnect();
  }

  Future<List<BluetoothService>> discoverServices() async {
    if (_device == null) throw BleException('No device connected');
    return await _device!.discoverServices();
  }

  Future<void> writeCharacteristic(
    BluetoothCharacteristic characteristic,
    List<int> value,
  ) async {
    await characteristic.write(value, withoutResponse: false);
  }

  Stream<List<int>> subscribeToCharacteristic(
    BluetoothCharacteristic characteristic,
  ) async* {
    await characteristic.setNotifyValue(true);
    yield* characteristic.lastValueStream;
  }
}

class BleException implements Exception {
  final String message;
  BleException(this.message);

  @override
  String toString() => 'BleException: $message';
}
```

### BLE Device Scanner Widget

```dart
// lib/features/ble/presentation/ble_scanner_page.dart
class BleScanner extends ConsumerWidget {
  const BleScanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scanResults = ref.watch(bleScannerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('BLE Devices')),
      body: ListView.builder(
        itemCount: scanResults.length,
        itemBuilder: (context, index) {
          final result = scanResults[index];
          final device = result.device;
          return ListTile(
            title: Text(device.platformName.isEmpty
              ? 'Unknown Device'
              : device.platformName),
            subtitle: Text(device.remoteId.toString()),
            trailing: Text('${result.rssi} dBm'),
            onTap: () => _connectToDevice(context, ref, device),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => ref.refresh(bleScannerProvider),
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Future<void> _connectToDevice(
    BuildContext context,
    WidgetRef ref,
    BluetoothDevice device,
  ) async {
    try {
      await ref
          .read(bleConnectionProvider(device.remoteId.toString()).notifier)
          .connect(device);
      if (context.mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => DeviceDetailPage(device: device)),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection failed: $e')),
        );
      }
    }
  }
}
```

### Reading BLE Characteristics

```dart
// Example: Reading heart rate from fitness tracker
class HeartRateMonitor extends ConsumerWidget {
  final BluetoothDevice device;
  const HeartRateMonitor({super.key, required this.device});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FutureBuilder<List<BluetoothService>>(
      future: device.discoverServices(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const CircularProgressIndicator();

        // Heart Rate Service UUID: 0x180D
        final hrService = snapshot.data!.firstWhere(
          (s) => s.uuid.toString() == '0000180d-0000-1000-8000-00805f9b34fb',
        );
        // Heart Rate Measurement Characteristic: 0x2A37
        final hrCharacteristic = hrService.characteristics.firstWhere(
          (c) => c.uuid.toString() == '00002a37-0000-1000-8000-00805f9b34fb',
        );

        return StreamBuilder<List<int>>(
          stream: ref
              .read(bleConnectionProvider(device.remoteId.toString()).notifier)
              .subscribeToCharacteristic(hrCharacteristic),
          builder: (context, snapshot) {
            if (!snapshot.hasData) return const Text('Waiting for data...');
            final heartRate = snapshot.data![1]; // Second byte is HR value
            return Text(
              '$heartRate BPM',
              style: Theme.of(context).textTheme.displayLarge,
            );
          },
        );
      },
    );
  }
}
```

## Bluetooth Classic (Serial)

### Setup - flutter_bluetooth_serial

```yaml
dependencies:
  flutter_bluetooth_serial: ^0.4.0
```

### Bluetooth Serial Service

```dart
// lib/services/bluetooth_serial_service.dart
import 'package:flutter_bluetooth_serial/flutter_bluetooth_serial.dart';
import 'dart:typed_data';

class BluetoothSerialService {
  BluetoothConnection? _connection;

  Future<List<BluetoothDevice>> getPairedDevices() async {
    return await FlutterBluetoothSerial.instance.getBondedDevices();
  }

  Future<void> connect(BluetoothDevice device) async {
    _connection = await BluetoothConnection.toAddress(device.address);
  }

  Future<void> disconnect() async {
    await _connection?.close();
    _connection = null;
  }

  void sendData(String data) {
    if (_connection?.isConnected ?? false) {
      _connection!.output.add(Uint8List.fromList(data.codeUnits));
    }
  }

  Stream<Uint8List> get dataStream {
    if (_connection == null) return Stream.empty();
    return _connection!.input!;
  }
}
```

## Permission Handling

```dart
// lib/utils/permission_helper.dart
import 'package:permission_handler/permission_handler.dart';

class PermissionHelper {
  static Future<bool> requestBluetoothPermissions() async {
    if (Platform.isAndroid) {
      final statuses = await [
        Permission.bluetoothScan,
        Permission.bluetoothConnect,
        Permission.location,
      ].request();
      return statuses.values.every((status) => status.isGranted);
    } else {
      final status = await Permission.bluetooth.request();
      return status.isGranted;
    }
  }
}
```

## Connection State Management

```dart
@freezed
class DeviceConnectionState with _$DeviceConnectionState {
  const factory DeviceConnectionState.disconnected() = _Disconnected;
  const factory DeviceConnectionState.connecting() = _Connecting;
  const factory DeviceConnectionState.connected(String deviceId) = _Connected;
  const factory DeviceConnectionState.error(String message) = _Error;
}

@riverpod
class DeviceConnection extends _$DeviceConnection {
  @override
  DeviceConnectionState build() => const DeviceConnectionState.disconnected();

  Future<void> connect(String deviceId) async {
    state = const DeviceConnectionState.connecting();
    try {
      // Connection logic
      state = DeviceConnectionState.connected(deviceId);
    } catch (e) {
      state = DeviceConnectionState.error(e.toString());
    }
  }
}
```

## Data Parsing & Validation

```dart
// lib/utils/ble_data_parser.dart
class BleDataParser {
  static int parseHeartRate(List<int> data) {
    if (data.isEmpty) throw FormatException('Empty data');
    final flags = data[0];
    final is16Bit = (flags & 0x01) != 0;
    return is16Bit ? (data[2] << 8) | data[1] : data[1];
  }

  static double parseTemperature(List<int> data) {
    if (data.length < 2) throw FormatException('Invalid data length');
    final rawValue = (data[1] << 8) | data[0];
    return rawValue / 100.0;
  }

  static bool validateChecksum(List<int> data) {
    if (data.length < 2) return false;
    final checksum = data.last;
    final calculatedChecksum = data.take(data.length - 1).reduce((a, b) => a ^ b);
    return checksum == calculatedChecksum;
  }
}
```

## Battery Optimization

```dart
// Stop scanning when app is in background
class BleLifecycleObserver extends WidgetsBindingObserver {
  final BleService bleService;
  BleLifecycleObserver(this.bleService);

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
        bleService.stopScanning();
        break;
      case AppLifecycleState.resumed:
        bleService.startScanning();
        break;
      default:
        break;
    }
  }
}
```

## Secure Pairing

```dart
class SecureBleConnection {
  Future<void> connectSecurely(BluetoothDevice device) async {
    await device.connect(timeout: const Duration(seconds: 15), autoConnect: false);
    await device.createBond();
    final isBonded = await device.bondState.first == BluetoothBondState.bonded;
    if (!isBonded) throw SecurityException('Device pairing failed');
  }
}
```

## Recommended Packages

```yaml
dependencies:
  flutter_blue_plus: ^1.32.0          # BLE (recommended)
  flutter_bluetooth_serial: ^0.4.0    # Classic Bluetooth
  permission_handler: ^11.3.0
  encrypt: ^5.0.3
```

## Related Skills

- `iot-network.md` - WiFi, MQTT, and WebSocket connectivity
- `iot-hardware.md` - NFC and USB Serial communication
- `performance-optimization.md` - Battery optimization techniques
