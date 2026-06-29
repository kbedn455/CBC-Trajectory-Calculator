/**
 * CBC Ballistic Calculator — i18n.js
 * Copyright (C) 2025 kbedn455
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CBC Ballistic Calculator — Translations
 */

const T = {
  pl: {
    title: 'CBC Ballistic Calculator',
    subtitle: 'Create Big Cannons 5.11.3 — fizyka: sashafiesta, kalibracja empiryczna',
    tab_xyz: 'Celowanie XYZ', tab_manual: 'Manualny',
    cannon_pos: 'Pozycja dziala', target_pos: 'Pozycja celu',
    x_cannon: 'X (Cannon Mount)', y_cannon: 'Y (Cannon Mount)', z_cannon: 'Z (Cannon Mount)',
    x_target: 'X (cel)', y_target: 'Y (cel)', z_target: 'Z (cel)',
    charges: 'Ladunki', powder_title: 'Powder Charge', cart_title: 'Big Cartridge',
    cart_use: 'Uzyj Big Cartridge',
    quantity: 'Ilosc', power_level: 'Power (poziom ladunku)',
    velocity_per: 'Predkosc/szt:', stress_per: 'Stres/szt:',
    total_velocity: 'Lacznie predkosci:', total_stress: 'Lacznie stresu:',
    corr_btn: 'Korekta Y celu (-25)', corr_undo: 'Cofnij korekte Y',
    corr_note: 'Korekta Y aktywna — pocisk uderzy ~25 blokow przed celem.',
    w_input: 'Uzupelnij wszystkie wspolrzedne i dodaj co najmniej jeden ladunek.',
    w_pitch: 'Kat pitch poza zakresem CBC (-30 do 60). Zmien liczbe ladunkow lub odleglosc.',
    w_rico: 'Pitch ponizej 15 — wysokie ryzyko rykoszetu. Uzyj mniejszej liczby ladunkow lub zwieksz korekte Y.',
    w_jam: 'Przekroczono limit ladunkow dla tego materialu. Uzyj Nethersteel + Screw Breech.',
    w_mortar: 'Mortar Stone dezintegruje sie powyzej 120 m/s. Zredukuj ladunki.',
    w_nocharge: 'Dodaj co najmniej jeden Powder Charge lub Big Cartridge aby wyswietlic trajektorie.',
    distance: 'Odleglosc', flight_time: 'Czas lotu', fuze: 'Fuze',
    yaw: 'Yaw (obrot poziomy)', pitch: 'Pitch (kat strzalu)',
    lower: 'Nizszy', higher: 'Wyzszy', closer: 'blizszy',
    configuration: 'Konfiguracja', material: 'Material dziala', projectile: 'Pocisk',
    pitch_angle: 'Kat pitch', height: 'Wysokosc nad ziemia',
    velocity: 'Predkosc', range: 'Zasieg', max_height: 'Maks. wys.',
    max_range: 'Maks. zasieg przy tym V:', blocks: 'blokow', optimal_angle: 'kat optymalny:',
    physics_credit: 'Fizyka:', dy_label: 'Roznica Y:', dy_corr: '(z korekta -25)',
    range_axis: 'Zasieg (bloki)', height_axis: 'Wysokosc (bloki)',
  },
  en: {
    title: 'CBC Ballistic Calculator',
    subtitle: 'Create Big Cannons 5.11.3 — physics: sashafiesta, empirical calibration',
    tab_xyz: 'XYZ Targeting', tab_manual: 'Manual',
    cannon_pos: 'Cannon Position', target_pos: 'Target Position',
    x_cannon: 'X (Cannon Mount)', y_cannon: 'Y (Cannon Mount)', z_cannon: 'Z (Cannon Mount)',
    x_target: 'X (target)', y_target: 'Y (target)', z_target: 'Z (target)',
    charges: 'Charges', powder_title: 'Powder Charge', cart_title: 'Big Cartridge',
    cart_use: 'Use Big Cartridge',
    quantity: 'Quantity', power_level: 'Power (charge level)',
    velocity_per: 'Velocity/unit:', stress_per: 'Stress/unit:',
    total_velocity: 'Total velocity:', total_stress: 'Total stress:',
    corr_btn: 'Y Target Correction (-25)', corr_undo: 'Undo Y correction',
    corr_note: 'Y correction active — shell will land ~25 blocks before target.',
    w_input: 'Fill in all coordinates and add at least one charge.',
    w_pitch: 'Pitch out of CBC range (-30 to 60). Change charge count or distance.',
    w_rico: 'Pitch below 15 — high ricochet risk. Use fewer charges or increase Y correction.',
    w_jam: 'Charge limit exceeded for this material. Use Nethersteel + Screw Breech.',
    w_mortar: 'Mortar Stone disintegrates above 120 m/s. Reduce charges.',
    w_nocharge: 'Add at least one Powder Charge or Big Cartridge to display the trajectory.',
    distance: 'Distance', flight_time: 'Flight time', fuze: 'Fuze',
    yaw: 'Yaw (horizontal)', pitch: 'Pitch (firing angle)',
    lower: 'Lower', higher: 'Higher', closer: 'closer',
    configuration: 'Configuration', material: 'Cannon material', projectile: 'Projectile',
    pitch_angle: 'Pitch angle', height: 'Height above ground',
    velocity: 'Velocity', range: 'Range', max_height: 'Max height',
    max_range: 'Max range at this V:', blocks: 'blocks', optimal_angle: 'optimal angle:',
    physics_credit: 'Physics:', dy_label: 'Y difference:', dy_corr: '(with correction -25)',
    range_axis: 'Range (blocks)', height_axis: 'Height (blocks)',
  }
};

let lang = 'pl';

function setLang(l) {
  lang = l;
  document.getElementById('lang-pl').classList.toggle('active', l === 'pl');
  document.getElementById('lang-en').classList.toggle('active', l === 'en');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (T[l][key]) el.textContent = T[l][key];
  });
  updateCartInfo('t');
  updateCartInfo('m');
  calcM();
}
