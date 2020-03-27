import { Component, OnInit, Input, ViewChild, Output, EventEmitter, Host, OnChanges, SimpleChanges } from '@angular/core';
import { Product, World } from '../world';
import { AppComponent } from '../app.component';


declare var require;
const ProgressBar = require('progressbar.js');

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnChanges {

  world: World;
  product: Product;
  lastupdate: number;
  rateProd: string;
  // tslint:disable-next-line:variable-name
  _money: number;
  revenu: number;
  currentcout: number;
  // tslint:disable-next-line:variable-name
  _qtmulti: string;

  temps: any;

  @ViewChild('bar') progressBarItem;
  progressbar: any;

  @Input()
  set money(value: number) {
    this._money = value;
    if (this._money && this.product) {
      this.calcMaxCanBuy();
      this.calcCout();
    }
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
    this.lastupdate = Date.now();
  }

  @Input()
  set qtmulti(value: string) {
    this._qtmulti = value;
    this.calcCout();
  }

  @Output()
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  @Output()
  notifyBuy: EventEmitter<number> = new EventEmitter<number>();

  constructor(@Host() parent: AppComponent) { }

 startFabrication() {
    this.progressbar.set(0);
    this.progressbar.animate(1, { duration: this.product.vitesse });
    this.product.timeleft = this.product.vitesse;
    this.countdown(this.product.id, this.product.vitesse);
  }

  calcScore(): void {
    const now = Date.now();
    const elapseTime = now - this.lastupdate;
    this.lastupdate = now;

    if (this.product.managerUnlocked) {
      if (this.product.timeleft !== 0) {
        this.product.timeleft = this.product.timeleft - elapseTime;
        if (this.product.timeleft <= 0) {
          this.product.timeleft = this.product.vitesse;
          // On prévient le composant parent que ce produit a généré son revenu.
          this.notifyProduction.emit(this.product);
          this.startFabrication();
        }
      } else {
        this.startFabrication();
      }

    } else {

      if (this.product.timeleft !== 0) {
        this.product.timeleft = this.product.timeleft - elapseTime;
        if (this.product.timeleft <= 0) {
          this.product.timeleft = 0;
          this.progressbar.set(0);
          this.notifyProduction.emit(this.product);
        }
      }
    }
  }


  ngOnInit() {
    this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
       strokeWidth: 50, color:
        '#34495e'
     });
    setInterval(() => { this.calcScore(); }, 100);
    this.revenu = this.product.revenu;
    this.currentcout = this.product.cout;
    if (this.product.vitesse / 1000 < 10) {
      this.temps = '0' + this.product.vitesse / 1000;
    } else {
      this.temps = this.product.vitesse / 1000;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.rate) {
      if (changes.rate.currentValue === 'Max') {
        this.rateProd = this.calcMaxCanBuy().toString();
      } else {
        this.rateProd = changes.rate.currentValue;
      }
    }
  }

  updateBuy() {
    if (this._money >= this.currentcout) {
      // tslint:disable-next-line:radix
      this.notifyBuy.emit(this.product.cout * ((1 - Math.pow(this.product.croissance, parseInt(this.rateProd))) /
        (1 - this.product.croissance)));
      // tslint:disable-next-line:radix
      this.product.quantite += parseInt(this.rateProd);
      this.revenu = this.product.revenu * this.product.quantite;
      this.calcCout();
    }
  }

  calcMaxCanBuy() {
    const qtMax = (Math.log((1 - this._money * (1 - this.product.croissance)) / this.product.cout + 1)) / Math.log(this.product.croissance);
    return Math.trunc(qtMax);
  }

  calcCout() {
    let res = 0;
    const price = this.product.cout;
    const multi = this.calcMaxCanBuy();

    if (this._qtmulti === 'Max') {
      res = (price * ((1 - Math.pow(this.product.croissance, multi)) / (1 - this.product.croissance)));
      this.currentcout = res;
      this.rateProd = this.calcMaxCanBuy().toString();
    }

    if (this._qtmulti === '100') {
      res = (price * ((1 - Math.pow(this.product.croissance, 100)) / (1 - this.product.croissance)));
      this.currentcout = res;
    }

    if (this._qtmulti === '10') {
      res = (price * ((1 - Math.pow(this.product.croissance, 10)) / (1 - this.product.croissance)));
      this.currentcout = res;
    }

    if (this._qtmulti === '1') {
      res = price * this.product.croissance ** this.product.quantite;
      this.currentcout = res;
    }
  }

  countdown(id: number, speed: number) {
    const countDownDate = new Date().getTime() + speed;
    // tslint:disable-next-line:only-arrow-functions
    const x = setInterval(function () {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      let hours = (Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).toString();
      let minutes = (Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).toString();
      let seconds = (Math.floor((distance % (1000 * 60)) / 1000)).toString();
      if (hours.match('0') || hours.match('-1')) {
        hours = '00';
      }
      if (minutes.match('0') || minutes.match('-1')) {
        minutes = '00';
      }
      if (seconds.match('0*') || seconds.match('-1')) {
        seconds = '0' + seconds;
      }
      document.getElementById('temps' + id).innerHTML = hours + ':' + minutes + ':' + seconds;
      if (distance < 0) {
        let time = '';
        if (speed <= 10000) {
          time = '0' + (speed / 1000).toString();
        } else {
          time = (speed / 1000).toString();
        }
        clearInterval(x);
        document.getElementById('temps' + id).innerHTML = hours + ':' + minutes + ':' + time;
      }
    }, 0);
  }
}
