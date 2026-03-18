---
name: iot-hardware
description: Hardware connectivity in Flutter including NFC (Near Field Communication) and USB Serial communication with practical examples
origin: Flutter Dev Assistant
---

# IoT - Hardware Connectivity

## NFC (Near Field Communication)

### Setup - nfc_manager

```yaml
dependencies:
  nfc_manager: ^3.3.0
```

### Permissions

```xml
<!-- Android: android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

```xml
<!-- iOS: ios/Runner/Info.plist -->
<key>NFCReaderUsageDescription</key>
<string>This app needs NFC to read tags</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
  <string>NDEF</string>
  <string>TAG</string>
</array>
```

### NFC Service

```dart
// lib/services/nfc_service.dart
import 'package:nfc_manager/nfc_manager.dart';

class NfcService {
  Future<bool> isAvailable() async {
    return await NfcManager.instance.isAvailable();
  }

  Future<String?> readTag() async {
    String? result;
    await NfcManager.instance.startSession(
      onDiscovered: (NfcTag tag) async {
        final ndef = Ndef.from(tag);
        if (ndef == null) {
          result = 'Tag is not NDEF formatted';
          return;
        }
        final cachedMessage = ndef.cachedMessage;
        if (cachedMessage == null) {
          result = 'No NDEF message found';
          return;
        }
        final record = cachedMessage.records.first;
        result = String.fromCharCodes(record.payload.skip(3)); // Skip language code
        await NfcManager.instance.stopSession();
      },
    );
    return result;
  }

  Future<bool> writeTag(String text) async {
    bool success = false;
    await NfcManager.instance.startSession(
      onDiscovered: (NfcTag tag) async {
        final ndef = Ndef.from(tag);
        if (ndef == null || !ndef.isWritable) {
          await NfcManager.instance.stopSession(errorMessage: 'Tag is not writable');
          return;
        }
        final message = NdefMessage([NdefRecord.createText(text)]);
        try {
          await ndef.write(message);
          success = true;
          await NfcManager.instance.stopSession();
        } catch (e) {
          await NfcManager.instance.stopSession(errorMessage: e.toString());
        }
      },
    );
    return success;
  }

  Future<void> stopSession() async {
    await NfcManager.instance.stopSession();
  }
}
```

### NFC Widget Example

```dart
class NfcTagReader extends StatefulWidget {
  @override
  State<NfcTagReader> createState() => _NfcTagReaderState();
}

class _NfcTagReaderState extends State<NfcTagReader> {
  final NfcService _nfcService = NfcService();
  String _tagData = 'No tag scanned';
  bool _isScanning = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('NFC Reader')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_tagData, style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center),
            const SizedBox(height: 32),
            if (_isScanning)
              const CircularProgressIndicator()
            else
              ElevatedButton(onPressed: _readTag, child: const Text('Scan NFC Tag')),
          ],
        ),
      ),
    );
  }

  Future<void> _readTag() async {
    final isAvailable = await _nfcService.isAvailable();
    if (!isAvailable) {
      setState(() => _tagData = 'NFC not available');
      return;
    }
    setState(() => _isScanning = true);
    try {
      final data = await _nfcService.readTag();
      setState(() { _tagData = data ?? 'No data found'; _isScanning = false; });
    } catch (e) {
      setState(() { _tagData = 'Error: $e'; _isScanning = false; });
    }
  }
}
```

## USB Serial Communication

### Setup - usb_serial

```yaml
dependencies:
  usb_serial: ^0.5.0
```

### USB Serial Service

```dart
// lib/services/usb_serial_service.dart
import 'package:usb_serial/usb_serial.dart';
import 'dart:typed_data';

class UsbSerialService {
  UsbPort? _port;

  Future<List<UsbDevice>> getDevices() async {
    return await UsbSerial.listDevices();
  }

  Future<void> connect(UsbDevice device, {int baudRate = 9600}) async {
    _port = await device.create();
    final opened = await _port!.open();
    if (!opened) throw Exception('Failed to open USB port');

    await _port!.setDTR(true);
    await _port!.setRTS(true);
    await _port!.setPortParameters(
      baudRate,
      UsbPort.DATABITS_8,
      UsbPort.STOPBITS_1,
      UsbPort.PARITY_NONE,
    );
  }

  Future<void> disconnect() async {
    await _port?.close();
    _port = null;
  }

  Future<void> write(String data) async {
    if (_port == null) throw Exception('Port not open');
    await _port!.write(Uint8List.fromList(data.codeUnits));
  }

  Stream<Uint8List>? get dataStream => _port?.inputStream;
}
```

### USB Serial Widget Example

```dart
class UsbSerialTerminal extends StatefulWidget {
  @override
  State<UsbSerialTerminal> createState() => _UsbSerialTerminalState();
}

class _UsbSerialTerminalState extends State<UsbSerialTerminal> {
  final UsbSerialService _usbService = UsbSerialService();
  final TextEditingController _controller = TextEditingController();
  final List<String> _messages = [];
  UsbDevice? _selectedDevice;

  @override
  void initState() {
    super.initState();
    _loadDevices();
  }

  Future<void> _loadDevices() async {
    final devices = await _usbService.getDevices();
    if (devices.isNotEmpty) setState(() => _selectedDevice = devices.first);
  }

  Future<void> _connect() async {
    if (_selectedDevice == null) return;
    try {
      await _usbService.connect(_selectedDevice!);
      _usbService.dataStream?.listen((data) {
        setState(() { _messages.add(String.fromCharCodes(data)); });
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Connected')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Connection failed: $e')));
    }
  }

  Future<void> _sendData() async {
    if (_controller.text.isEmpty) return;
    try {
      await _usbService.write(_controller.text);
      setState(() { _messages.add('Sent: ${_controller.text}'); _controller.clear(); });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Send failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('USB Serial Terminal'),
        actions: [IconButton(icon: const Icon(Icons.usb), onPressed: _connect)],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) => ListTile(title: Text(_messages[index])),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(hintText: 'Enter command'),
                  ),
                ),
                IconButton(icon: const Icon(Icons.send), onPressed: _sendData),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _usbService.disconnect();
    _controller.dispose();
    super.dispose();
  }
}
```

## Device Validation

```dart
class DeviceValidator {
  static bool isValidUsbDevice(UsbDevice device) {
    if (device.vid == null || device.pid == null) return false;
    // Add your specific device validation logic
    return true;
  }
}
```

## Command Queue Pattern

```dart
// Queue commands to avoid overwhelming device
class CommandQueue {
  final Queue<Command> _queue = Queue();
  bool _isProcessing = false;

  void addCommand(Command command) {
    _queue.add(command);
    _processQueue();
  }

  Future<void> _processQueue() async {
    if (_isProcessing || _queue.isEmpty) return;
    _isProcessing = true;
    while (_queue.isNotEmpty) {
      final command = _queue.removeFirst();
      try {
        await command.execute();
        await Future.delayed(const Duration(milliseconds: 100));
      } catch (e) {
        // Handle error
      }
    }
    _isProcessing = false;
  }
}

abstract class Command {
  Future<void> execute();
}
```

## Batch Data Transmission

```dart
// Send data in batches to reduce overhead
class BatchDataSender {
  final List<String> _buffer = [];
  Timer? _timer;

  void addData(String data) {
    _buffer.add(data);
    _timer?.cancel();
    _timer = Timer(const Duration(milliseconds: 100), _sendBatch);
    if (_buffer.length >= 10) _sendBatch();
  }

  void _sendBatch() {
    if (_buffer.isEmpty) return;
    final batch = _buffer.join(',');
    usbService.send(batch);
    _buffer.clear();
  }
}
```

## Recommended Packages

```yaml
dependencies:
  nfc_manager: ^3.3.0
  usb_serial: ^0.5.0
  permission_handler: ^11.3.0
```

## Related Skills

- `iot-bluetooth.md` - Bluetooth connectivity
- `iot-network.md` - WiFi, MQTT, and WebSocket connectivity
- `performance-optimization.md` - Hardware communication optimization
