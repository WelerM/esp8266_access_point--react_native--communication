import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';

export default function App() {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Helper function to log messages and display them in the UI
  const logMessage = (message: string) => {
    console.log(message);
    setLogs(prevLogs => [...prevLogs, message]);
  };

  const connectWebSocket = () => {
    const serverIP = '192.168.4.1'; // Fixed IP address

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      logMessage('WebSocket is already connected.');
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        logMessage('Reconnection attempts cleared due to active connection.');
      }
      setIsConnected(true);
      return;
    }

    socket.current = new WebSocket(`ws://${serverIP}:81`); // Using fixed IP and port 81

    socket.current.onopen = () => {
      logMessage('WebSocket Connected');
      setIsConnected(true);
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        logMessage('Reconnection attempts cleared after successful connection.');
      }
    };

    socket.current.onmessage = (event: MessageEvent) => {
      logMessage(`Received: ${event.data}`);
    };

    socket.current.onerror = (error: Event) => {
      logMessage(`WebSocket Error: ${error}`);
      setIsConnected(false);
    };

    socket.current.onclose = (e: CloseEvent) => {
      logMessage(`WebSocket Closed: ${e.code}, ${e.reason}`);
      setIsConnected(false);

      if (e.code === 1006 || !isConnected) {
        logMessage('Connection was reset. Attempting to reconnect...');
        attemptReconnect();
      }
    };
  };

  const attemptReconnect = () => {
    if (!reconnectIntervalRef.current) {
      reconnectIntervalRef.current = setInterval(() => {
        logMessage('Attempting to reconnect...');
        connectWebSocket();
      }, 5000);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };
  }, []);

  const sendCommand = (command: string) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(command);
    } else {
      logMessage(`WebSocket is not open. Ready state: ${socket.current?.readyState}`);
    }
  };

  const handlePressIn = (command: string) => {
    sendCommand(command);
  };

  const handlePressOut = () => {
    sendCommand('stop');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusIndicator, { backgroundColor: isConnected ? 'green' : 'red' }]} />
      <Text>{isConnected ? 'Server Connected' : 'Server Disconnected'}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('forward')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Forward</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('left')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Left</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('stop')}
          onPressOut={() => {}}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('right')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Right</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('backward')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Backward</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    margin: 5,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    margin: 10,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  logContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  logText: {
    fontSize: 12,
    color: 'black',
  },
});
