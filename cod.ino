//servo 
#include <ESP32Servo.h>

//rfid
#include <SPI.h>
#include <MFRC522.h>

//http
#include <WiFi.h>
#include <WebServer.h>

//LED
#include <FastLED.h>

#define LED_PIN     33
#define NUM_LEDS    100
#define BRIGHTNESS  200
#define LED_TYPE    WS2812
#define COLOR_ORDER GRB

#define SS_PIN 5 //SDA
#define RST_PIN 22
String ultimoUID = "";  

Servo servo;
Servo servo2;
Servo servo3;
Servo servo4;

int pinoServo=25;
int pinoServo2=26;
int pinoServo3=27;
int pinoServo4=14;

MFRC522 mfrc522(SS_PIN, RST_PIN);

CRGB leds[NUM_LEDS];

const char* ssid = "Caio";
const char* password = "autominds";

WebServer server(80);

int getLedPositionByItem(String item) {
  if (item == "Grampo Ater BT MT") {
  led40();
  } 

  if (item == "Paraf Fenda CAB") {
    led40();
  }
  if (item == "Arruela Pressao M6 DIN") {
    led50();
  }

  if (item == "Cabo Cobre Eletrol") {
    led50();
  }

  if (item == "Abraçadeira Aluminio") {
    led60();
  }

  if (item == "Terminal Cobre Rosqueado") {
    led60();
  }

  if (item == "Porca SX W 5/8") {
    led70();
  }
  if (item == "Etiqueta Metalica Manual") {
    led70();
  }
  return 0;
}




void led40(){
    int limite4 = 53;

    for(int i =0; i < NUM_LEDS; i++){
      leds [i] = (i <= limite4 ? CRGB::Red : CRGB::Black);
      FastLED.show();
      delay(50);
    }

        unsigned long tempoInicio = millis();
    while (millis() - tempoInicio < 3000) {
        rfid(); 
        delay(50); 
    }

  if(ultimoUID == "BB EF B8 89"){
     Serial.print("UID encontrado: ");
  Serial.println(ultimoUID);
    for (int pos = 0; pos <= 180; pos++){
      servo3.write(pos);
      delay(15);
    }
    
      delay(3000);

    for(int pos =180; pos >=0; pos --){
      servo3.write(pos);
      delay(15);
    }
  }
  else {
    Serial.println("Não leu o cartão");
  }

        for (int i = 0; i <NUM_LEDS; i++){
    leds[i] = CRGB::Black;
  }
  FastLED.show();
  ultimoUID = "";  // Reseta o cartão 
}

  //LED 50
void led50(){
  int limite5 = 43;

  for(int i =0; i < NUM_LEDS; i++){
    leds [i] = (i<= limite5 ? CRGB::Red : CRGB::Black);
    FastLED.show();
    delay(50);
  }

        unsigned long tempoInicio = millis();
    while (millis() - tempoInicio < 3000) {
        rfid(); 
        delay(50); 
    }


if(ultimoUID =="BB EF B8 89"){
   Serial.print("UID encontrado: ");
  Serial.println(ultimoUID);
  for(int pos = 0; pos <= 180; pos++){
    servo2.write(pos);
    delay(15);
  }

  delay(3000);

  for(int pos = 180; pos >= 0; pos --){
    servo2.write(pos);
    delay(15);
  }
}

else{
  return;
}

  for(int i =0; i <NUM_LEDS; i++){
    leds[i] = CRGB::Black;
  }
  FastLED.show();
ultimoUID = "";  // Reseta o cartão 

}

//LED 60
void led60(){
  int limite6 = 25;

  for(int i =0;i < NUM_LEDS; i++){
    leds[i] = (i <= limite6 ? CRGB::Red : CRGB::Black);
    FastLED.show();
    delay(50);
  }

        unsigned long tempoInicio = millis();
    while (millis() - tempoInicio < 3000) {
        rfid(); 
        delay(50); 
    }

if(ultimoUID == "BB EF B8 89"){
   Serial.print("UID encontrado: ");
  Serial.println(ultimoUID);
  for(int pos = 0; pos <= 180; pos ++){
    servo4.write(pos);
    delay(15);
  }

  delay(3000);

  for(int pos = 180; pos >=0; pos --){
    servo4.write(pos);
    delay(15);
  }
}

else {
  return;
}

  for(int i = 0; i<NUM_LEDS; i++){
    leds[i] = CRGB::Black;
  }
  FastLED.show();
  ultimoUID = "";  // Reseta o cartão 
}

  //LED70

  void led70(){
     Serial.print("UID encontrado: ");
  Serial.println(ultimoUID);
    int limite7 = 35;

    for(int i = 0; i< NUM_LEDS; i++){
      leds[i] = (i<= limite7 ? CRGB::Red : CRGB::Black);
      FastLED.show();
      delay(50);
    }

          unsigned long tempoInicio = millis();
    while (millis() - tempoInicio < 3000) {
        rfid(); 
        delay(50); 
    }

  if(ultimoUID == "BB EF B8 89"){
    for (int pos = 180; pos >= 0; pos ++){
      servo.write(pos);
      delay(15);
    }

    delay(3000);

    for(int pos=0; pos <= 180; pos--){
      servo.write(pos);
      delay(15);
    }
  }

  else{
    return;
  }

    for(int i = 0; i<NUM_LEDS; i++){
      leds[i] = CRGB::Black;
    }
    FastLED.show();
    ultimoUID = "";  // Reseta o cartão 
  }

void rfid(){
if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  ultimoUID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) ultimoUID += "0";
    ultimoUID += String(mfrc522.uid.uidByte[i], HEX);
    ultimoUID += " ";
  }

  ultimoUID.trim();
  ultimoUID.toUpperCase();

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}

void acenderLEDS(int limite) {
  Serial.print("Acendendo até o LED: ");
  Serial.println(limite);

  // for (int i =0; i < NUM_LEDS; i++){
  //   leds[i] = CRGB::Black;
  // }
  // FastLED.show();

  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = (i <= limite) ? CRGB::Red : CRGB::Black;
     FastLED.show();
    delay(100);
  }
}

void apagarLEDS(){
  for (int i = 0; i <NUM_LEDS; i++){
    leds[i] = CRGB::Black;
  }
  FastLED.show();
}

void handleLED() {
  String item = server.arg("item");
  Serial.println("Item recebido: " + item);

  int ledLimite = getLedPositionByItem(item);
  acenderLEDS(ledLimite);

  server.send(200, "text/plain", "LEDs acesos até: " + String(ledLimite));
}

void setup() {
  Serial.begin(115200);
  delay(100);

  //servo motor
  servo.attach(pinoServo);
  servo2.attach(pinoServo2);
  servo3.attach(pinoServo3);
  servo4.attach(pinoServo4);

  //rfid
  SPI.begin(18, 19, 23, SS_PIN); //SCK, MISO, MOSI e ss_pin
    mfrc522.PCD_Init();
    Serial.println("Aproxima o cartao RFID.. ");

  //http
  IPAddress local_IP(10, 40, 50, 200);
  IPAddress gateway (10, 40, 50, 1);
  IPAddress subnet (255, 255, 255, 0);

  WiFi.config(local_IP, gateway, subnet);


  Serial.println("Conectando ao Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi conectado com sucesso!");
  Serial.print("IP da ESP32: ");
  Serial.println(WiFi.localIP());

  // inicia os leds
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  acenderLEDS(0); // começa desligado

  // inicia o serve
  server.on("/led", handleLED);
  server.begin();
  Serial.println("Servidor HTTP iniciado!");
}

void loop() {
  apagarLEDS();
  delay(100);

  rfid();
  
  FastLED.show();
  server.handleClient();
}