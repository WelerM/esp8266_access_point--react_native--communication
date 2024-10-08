//This code creates an access point wi-fi that enables communication with mobile devices like a smarphone for exemple.
//The mobile device will connect to the ESP8266 network and control it through react native

#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>

// Access Point credentials
const char* ssid = "ESP8266_AP";
const char* password = "123456789";

// WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Define GPIO pins for motor control
const int MOTOR1_IN1 = 5;  // GPIO5 (D1) - Motor 1
const int MOTOR1_IN2 = 4;  // GPIO4 (D2) - Motor 1
const int MOTOR2_IN3 = 0;  // GPIO0 (D3) - Motor 2
const int MOTOR2_IN4 = 2;  // GPIO2 (D4) - Motor 2

#define LED_PIN 2  // Onboard LED

// Define PWM parameters
const int PWM_FREQ = 1000;  // PWM frequency (1 kHz)
const int PWM_RESOLUTION = 8;  // PWM resolution (8-bit, 0-255)
const int MOTOR_SPEED = 90;  // Less than this can potentially make the cart unable to move

// Initialize PWM pins
const int MOTOR1_PWM = MOTOR1_IN1;
const int MOTOR2_PWM = MOTOR2_IN3;

void setup() {
  Serial.begin(115200);

  // Set up the Access Point
  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");

  Serial.println(IP);


  // Set up WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // Initialize motor control pins
  pinMode(MOTOR1_IN1, OUTPUT);
  pinMode(MOTOR1_IN2, OUTPUT);
  pinMode(MOTOR2_IN3, OUTPUT);
  pinMode(MOTOR2_IN4, OUTPUT);

  pinMode(LED_PIN, OUTPUT);

  // Initialize PWM
  analogWriteFreq(PWM_FREQ);
  analogWriteRange(pow(2, PWM_RESOLUTION));

  // Set initial motor speed
  analogWrite(MOTOR1_PWM, MOTOR_SPEED);
  analogWrite(MOTOR2_PWM, MOTOR_SPEED);

  // Ensure motors are stopped initially
  stopMotors();
}

void loop() {
  webSocket.loop();



}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_TEXT) {
    String message = "";
    for (size_t i = 0; i < length; i++) {
      message += (char)payload[i];
    }

    Serial.print("Message received: ");
    Serial.println(message);

    // Process commands
    if (message == "forward") {
      moveForward();
    } else if (message == "backward") {
      moveBackward();
    } else if (message == "left") {
      turnLeft();
    } else if (message == "right") {
      turnRight();
    } else if (message == "stop") {
      stopMotors();
    } else {
      Serial.println("Unknown command");
    }
  }
}

// Functions to control motors with speed control
void moveForward() {
  Serial.println("Moving Forward");

  blinkLed();

  // Set the speed using PWM
  analogWrite(MOTOR1_IN1, MOTOR_SPEED);  // Motor 1 forward
  analogWrite(MOTOR1_IN2, LOW);          // Motor 1 backward (off)
  analogWrite(MOTOR2_IN3, MOTOR_SPEED);  // Motor 2 forward
  analogWrite(MOTOR2_IN4, LOW);          // Motor 2 backward (off)
}

void moveBackward() {
  Serial.println("Moving Backward");

  blinkLed();

  // Set the speed using PWM
  analogWrite(MOTOR1_IN1, LOW);          // Motor 1 forward (off)
  analogWrite(MOTOR1_IN2, MOTOR_SPEED);  // Motor 1 backward
  analogWrite(MOTOR2_IN3, LOW);          // Motor 2 forward (off)
  analogWrite(MOTOR2_IN4, MOTOR_SPEED);  // Motor 2 backward
}

void turnLeft() {
  Serial.println("Turning Left");

  blinkLed();

  // Set the speed for turning
  analogWrite(MOTOR1_IN1, MOTOR_SPEED);  // Motor 1 forward
  analogWrite(MOTOR1_IN2, LOW);          // Motor 1 backward (off)
  analogWrite(MOTOR2_IN3, LOW);          // Motor 2 forward (off)
  analogWrite(MOTOR2_IN4, MOTOR_SPEED);  // Motor 2 backward
}

void turnRight() {
  Serial.println("Turning Right");

  blinkLed();

  // Set the speed for turning
  analogWrite(MOTOR1_IN1, LOW);          // Motor 1 forward (off)
  analogWrite(MOTOR1_IN2, MOTOR_SPEED);  // Motor 1 backward
  analogWrite(MOTOR2_IN3, MOTOR_SPEED);  // Motor 2 forward
  analogWrite(MOTOR2_IN4, LOW);          // Motor 2 backward (off)
}

void stopMotors() {
  Serial.println("Stopping");

  digitalWrite(LED_PIN, HIGH);  // Turn off LED

  // Stop all motors
  analogWrite(MOTOR1_IN1, LOW);
  analogWrite(MOTOR1_IN2, LOW);
  analogWrite(MOTOR2_IN3, LOW);
  analogWrite(MOTOR2_IN4, LOW);
}

void blinkLed() {
  digitalWrite(LED_PIN, LOW);  //Turn off led

}
