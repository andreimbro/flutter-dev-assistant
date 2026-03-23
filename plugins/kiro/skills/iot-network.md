---
name: iot-network
description: Network-based IoT connectivity including WiFi configuration, MQTT messaging, and WebSocket real-time communication in Flutter
origin: Flutter Dev Assistant
---

# IoT - Network Connectivity

## WiFi Configuration

### Setup - wifi_iot

```yaml
dependencies:
  wifi_iot: ^0.3.18
  network_info_plus: ^5.0.0
```

### WiFi Service

```dart
// lib/services/wifi_service.dart
import 'package:wifi_iot/wifi_iot.dart';
import 'package:network_info_plus/network_info_plus.dart';

class WiFiService {
  Future<List<WifiNetwork>> scanNetworks() async {
    final canScan = await WiFiForIoTPlugin.isEnabled();
    if (!canScan) throw Exception('WiFi is disabled');
    return await WiFiForIoTPlugin.loadWifiList();
  }

  Future<bool> connectToNetwork({
    required String ssid,
    required String password,
    bool isWPA = true,
  }) async {
    return await WiFiForIoTPlugin.connect(
      ssid,
      password: password,
      security: isWPA ? NetworkSecurity.WPA : NetworkSecurity.WEP,
    );
  }

  Future<WiFiInfo> getCurrentWiFiInfo() async {
    final info = NetworkInfo();
    return WiFiInfo(
      ssid: await info.getWifiName(),
      bssid: await info.getWifiBSSID(),
      ip: await info.getWifiIP(),
      gateway: await info.getWifiGatewayIP(),
    );
  }

  Future<void> disconnect() async {
    await WiFiForIoTPlugin.disconnect();
  }
}

class WiFiInfo {
  final String? ssid;
  final String? bssid;
  final String? ip;
  final String? gateway;
  WiFiInfo({this.ssid, this.bssid, this.ip, this.gateway});
}
```

## MQTT (IoT Messaging)

### Setup - mqtt_client

```yaml
dependencies:
  mqtt_client: ^10.2.0
```

### MQTT Service with Riverpod

```dart
// lib/services/mqtt_service.dart
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'mqtt_service.g.dart';

@riverpod
class MqttConnection extends _$MqttConnection {
  MqttServerClient? _client;

  @override
  MqttConnectionState build() => MqttConnectionState.disconnected;

  Future<void> connect({
    required String broker,
    required int port,
    required String clientId,
    String? username,
    String? password,
  }) async {
    _client = MqttServerClient(broker, clientId);
    _client!.port = port;
    _client!.keepAlivePeriod = 60;
    _client!.autoReconnect = true;

    final connMessage = MqttConnectMessage()
        .withClientIdentifier(clientId)
        .startClean()
        .withWillQos(MqttQos.atLeastOnce);

    if (username != null && password != null) {
      connMessage.authenticateAs(username, password);
    }
    _client!.connectionMessage = connMessage;

    try {
      await _client!.connect();
      state = MqttConnectionState.connected;
    } catch (e) {
      state = MqttConnectionState.disconnected;
      throw MqttException('Connection failed: $e');
    }
  }

  void publish(String topic, String message, {MqttQos qos = MqttQos.atLeastOnce}) {
    if (_client?.connectionStatus?.state != MqttConnectionState.connected) {
      throw MqttException('Not connected');
    }
    final builder = MqttClientPayloadBuilder();
    builder.addString(message);
    _client!.publishMessage(topic, qos, builder.payload!);
  }

  void subscribe(String topic, {MqttQos qos = MqttQos.atLeastOnce}) {
    if (_client?.connectionStatus?.state != MqttConnectionState.connected) {
      throw MqttException('Not connected');
    }
    _client!.subscribe(topic, qos);
  }

  Stream<String> getMessagesForTopic(String topic) {
    if (_client == null) return Stream.empty();
    return _client!.updates!
        .where((messages) => messages.isNotEmpty)
        .expand((messages) => messages)
        .where((message) => message.topic == topic)
        .map((message) {
          final payload = message.payload as MqttPublishMessage;
          return MqttPublishPayload.bytesToStringAsString(payload.payload.message);
        });
  }

  Future<void> disconnect() async {
    _client?.disconnect();
    state = MqttConnectionState.disconnected;
  }
}

class MqttException implements Exception {
  final String message;
  MqttException(this.message);

  @override
  String toString() => 'MqttException: $message';
}
```

### MQTT Widget Example

```dart
// Smart home temperature monitor
class TemperatureMonitor extends ConsumerWidget {
  const TemperatureMonitor({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectionState = ref.watch(mqttConnectionProvider);

    if (connectionState != MqttConnectionState.connected) {
      return const Center(child: Text('Connecting to MQTT broker...'));
    }

    ref.read(mqttConnectionProvider.notifier).subscribe('home/temperature');

    return StreamBuilder<String>(
      stream: ref.read(mqttConnectionProvider.notifier)
          .getMessagesForTopic('home/temperature'),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Text('Waiting for data...');
        final temperature = double.tryParse(snapshot.data!) ?? 0.0;
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('${temperature.toStringAsFixed(1)}°C',
                style: Theme.of(context).textTheme.displayLarge),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                ref.read(mqttConnectionProvider.notifier)
                    .publish('home/ac/command', 'ON');
              },
              child: const Text('Turn On AC'),
            ),
          ],
        );
      },
    );
  }
}
```

## WebSocket (Real-time Communication)

### Setup - web_socket_channel

```yaml
dependencies:
  web_socket_channel: ^2.4.0
```

### WebSocket Service

```dart
// lib/services/websocket_service.dart
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'websocket_service.g.dart';

@riverpod
class WebSocketConnection extends _$WebSocketConnection {
  WebSocketChannel? _channel;

  @override
  bool build() => false;

  void connect(String url) {
    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
      state = true;
      _channel!.stream.listen(
        (message) { /* Handle incoming messages */ },
        onError: (error) { state = false; },
        onDone: () { state = false; },
      );
    } catch (e) {
      throw WebSocketException('Connection failed: $e');
    }
  }

  void send(String message) {
    if (_channel == null) throw WebSocketException('Not connected');
    _channel!.sink.add(message);
  }

  Stream<dynamic> get messages {
    if (_channel == null) return Stream.empty();
    return _channel!.stream;
  }

  void disconnect() {
    _channel?.sink.close();
    _channel = null;
    state = false;
  }
}

class WebSocketException implements Exception {
  final String message;
  WebSocketException(this.message);

  @override
  String toString() => 'WebSocketException: $message';
}
```

## Error Handling & Retry Logic

```dart
// lib/utils/connection_retry.dart
class ConnectionRetry {
  static Future<T> withRetry<T>({
    required Future<T> Function() operation,
    int maxAttempts = 3,
    Duration delay = const Duration(seconds: 2),
  }) async {
    int attempts = 0;
    while (attempts < maxAttempts) {
      try {
        return await operation();
      } catch (e) {
        attempts++;
        if (attempts >= maxAttempts) rethrow;
        await Future.delayed(delay * attempts);
      }
    }
    throw Exception('Max retry attempts reached');
  }
}

// Usage
await ConnectionRetry.withRetry(
  operation: () => mqttService.connect(broker),
  maxAttempts: 3,
);
```

## Timeout Handling

```dart
Future<T> withTimeout<T>({
  required Future<T> Function() operation,
  Duration timeout = const Duration(seconds: 10),
}) async {
  return await operation().timeout(
    timeout,
    onTimeout: () => throw TimeoutException('Operation timed out'),
  );
}
```

## Auto-Reconnect Pattern

```dart
class AutoReconnect {
  final String broker;
  Timer? _reconnectTimer;

  AutoReconnect(this.broker);

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () async {
      try {
        await mqttService.connect(broker);
      } catch (e) {
        _scheduleReconnect();
      }
    });
  }

  void dispose() => _reconnectTimer?.cancel();
}
```

## Encrypt Sensitive Data

```dart
import 'package:encrypt/encrypt.dart';

class DataEncryption {
  final key = Key.fromSecureRandom(32);
  final iv = IV.fromSecureRandom(16);

  String encrypt(String plainText) {
    final encrypter = Encrypter(AES(key));
    return encrypter.encrypt(plainText, iv: iv).base64;
  }

  String decrypt(String encryptedText) {
    final encrypter = Encrypter(AES(key));
    return encrypter.decrypt64(encryptedText, iv: iv);
  }
}
```

## Connection Pooling

```dart
class ConnectionPool {
  final Map<String, MqttConnection> _connections = {};

  Future<MqttConnection> getConnection(String broker) async {
    if (_connections.containsKey(broker)) return _connections[broker]!;
    final connection = await MqttConnection.create(broker);
    _connections[broker] = connection;
    return connection;
  }

  Future<void> closeAll() async {
    for (final connection in _connections.values) {
      await connection.close();
    }
    _connections.clear();
  }
}
```

## Recommended Packages

```yaml
dependencies:
  wifi_iot: ^0.3.18
  network_info_plus: ^5.0.0
  mqtt_client: ^10.2.0
  web_socket_channel: ^2.4.0
  encrypt: ^5.0.3
  rxdart: ^0.27.7                     # Stream utilities
```

## Related Skills

- `iot-bluetooth.md` - Bluetooth connectivity
- `iot-hardware.md` - NFC and USB Serial communication
- `performance-optimization.md` - Network optimization techniques
