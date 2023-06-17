# QRIS Simulator

>
> Kata Kata yang diambil dari website official QRIS :
>> PERHATIAN
>>
>> Harap diperhatikan bahwa API QRIS ini sifatnya adalah LIVE / PRODUCTION, saat Anda melakukan SCAN terhadap QRIS yang muncul, maka saldo e-wallet Anda akan benar-benar berkurang dan tidak dapat dikembalikan (tidak ada refund).
>
> Sungguh menyedihkan T_T

Official QRIS tidak memberikan developer simulator yang dapat dicoba
tanpa mengurangi saldo, dengan itu project ini dibuat sebagai
simulator penyedia QRIS yang dapat anda gunakan untuk mencoba
integrasi program anda.

Simulator ini dibuat 90% menyerupai
behaviour QRIS itu sendiri, jika program anda lulus menggunakan
simulator ini, maka anda hanya perlu mengganti beberapa variable untuk
melanjutkan aplikasi anda ke tahap produksi.


## Instalasi

1. Lakukan clone repo ini
    ```
    git clone https://github.com/wowotek/qris_simulator.git
    ```
2. instalasi dependensi yang dibutuhkan
    ```
    npm install
    ```
3. jalankan server
    ```
    npm start
    ```

## Kustomisasi

1. Lakukan step 1 hingga 2 pada tahap instalasi
2. ubah hal yang perlu anda ubah
3. jalankan server menggunakan `ts-node-dev`
    ```
    npm run start-dev
    ```
