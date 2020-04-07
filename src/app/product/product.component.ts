import {Component, OnInit, Input, ViewChild, Output, EventEmitter, Host, OnChanges, SimpleChanges, ElementRef} from '@angular/core';
import {Pallier, Product, World} from '../world';
import { AppComponent } from '../app.component';
import {apiUrl} from '../api';
import {RestService} from '../rest.service';
import {ToasterService} from 'angular2-toaster/src/toaster.service';


declare var require;
const ProgressBar = require('progressbar.js');

// @ts-ignore
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  world: World;
  product: Product;
  lastupdate: number;
  // tslint:disable-next-line:variable-name
  _money: number;
  // tslint:disable-next-line:variable-name
  _totalCost = 0;
  revenu: number;
  currentcout: number;
  // tslint:disable-next-line:variable-name
  _qtmulti: string;
  isRun: boolean;
  temps: any;
  toasterService: ToasterService;

  @ViewChild('bar') progressBarItem: ElementRef;
  progressbar: any;
  achat: number;

  constructor(private service: RestService, toasterService: ToasterService) {
    this.toasterService = toasterService;

  }

  @Input()
  set money(value: number) {
    this._money = value;
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
    if (this.product && this.product.timeleft > 0) {
      this.lastupdate = Date.now();
      const progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.progressbar.set(progress);
      this.progressbar.animate(1, {duration: this.product.timeleft});
    }
  }

  @Input()
  set qtmulti(value: string) {
    // tslint:disable-next-line:triple-equals
    if (value == 'Max') {
      this._qtmulti = 'X' + this.calcMaxCanBuy();
    } else {
      this._qtmulti = value;
    }
  }

  @Output()
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  @Output()
  notifyBuy: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  notifyUnlocked: EventEmitter<Pallier> = new EventEmitter<Pallier>();

  @Output() notifyAchat: EventEmitter<number> = new EventEmitter<number>();


  ngOnInit(): void {
    setInterval(() => {
      this.calcScore();
    }, 100);
    this.productsUnlocks();
    // if (this.product.cout <= this._money) {
    //   this.toasterService.pop('Vous avez débloqué le produit ' + this.product.name);
    // }
  }

  getImage() {
    return apiUrl + this.product.logo;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    setTimeout(() => {
      this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
        strokeWidth: 4,
        easing: 'easeInOut',
        color: '#d8a683',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
      });
    }, 100);
  }

  startFabrication() {
    if (this.product.quantite >= 1 && !this.isRun) {
      console.log('Fabrication commencée');
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.progressbar.animate(1, {duration: this.product.vitesse});
      this.isRun = true;
    }
  }

  calcScore() {
    if (this.isRun) {
      if (this.product.timeleft > 0) {
        this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
        this.lastupdate = Date.now();
        console.log('calcScore coucou');
      } else {
        this.isRun = false;
        this.lastupdate = 0;
        this.product.timeleft = 0;
        this.progressbar.set(0);
        this.notifyProduction.emit(this.product);
        this.service.putProduct(this.product);
      }
    }
    if (this.product.managerUnlocked) {
      this.startFabrication();
    }
  }

  buyQuantite() {
    let qty = 0;

    // tslint:disable-next-line:max-line-length
    if (this._qtmulti === '1') { qty = 1; } else if (this._qtmulti === '10') { qty = 10; } else if (this._qtmulti === '100') { qty = 100; } else if (this._qtmulti === 'Max') { qty = this.calcMaxCanBuy(); }

    return qty;
  }
  // onBuy()
  updateBuy() {
    // tslint:disable-next-line:prefer-const one-variable-per-declaration
    console.log('updateBuy');
    const qty = this.buyQuantite();
    // tslint:disable-next-line:prefer-const
    let coutAchat = this.calcCout(qty);
    console.log('coutAchat :' + qty);
    if (this._money >= coutAchat) {
      console.log('test', + coutAchat);
      this.notifyBuy.emit(coutAchat);
      this.product.quantite = this.product.quantite + qty;
      this.service.putProduct(this.product);
    }
  }

  getRealPrice() {
    return this.product.cout * this.product.croissance ** this.product.quantite;
  }

  calcMaxCanBuy() {
    const price = this.getRealPrice();
    let res;
    let multiplicateur;

    if (this._qtmulti === 'max') {
      // multiplicateur =Math.round((Math.log((this.worldMoney*(this.product.croissance-1))/(price)+1))/Math.log(this.product.croissance)-1);
      multiplicateur = Math.ceil(
        Math.log(
          1 - (this._money * (1 - this.product.croissance)) / price
        ) /
        Math.log(this.product.croissance) -
        1
      );
      console.log(multiplicateur);
      if (multiplicateur <= 0) {
        multiplicateur = 1;
      }
    } else {
      // tslint:disable-next-line:radix
      multiplicateur = parseInt(this._qtmulti.substr(1));
    }
    res =
      price *
      ((1 - this.product.croissance ** multiplicateur) /
        (1 - this.product.croissance));
    this.achat = multiplicateur;
    return res;
  }

  calcCout(qty: number) {

    let totalCost = 0;
    console.log('nom du produit  ' + this.product.name);
    console.log('cout du prod ' + this.product.cout);
    console.log('cout du croissance ' + this.product.croissance);
    console.log('cout du quantite ' + this.product.quantite);
    let costForOne = this.product.cout * (this.product.croissance ** this.product.quantite);
    this.product.cout = costForOne;
    this.service.putProduct(this.product);
    console.log('prix pour un prod ' + costForOne);
    console.log('quantité ' + qty);
    for (let i = 0; i < qty; i++) {
      totalCost += costForOne;
      costForOne = costForOne * this.product.croissance;
    }
    this._totalCost = totalCost;
    return totalCost;

  }

  countdown(id: number, speed: number) {
    const countDownDate = new Date().getTime() + speed;
    // tslint:disable-next-line:only-arrow-functions
    const x = setInterval(function() {
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
  calcUpgrade(pallier: Pallier) {
    switch (pallier.typeratio) {
      case 'VITESSE':
        this.product.vitesse = this.product.vitesse / pallier.ratio;
        break;
      case 'GAIN':
        this.product.revenu = this.product.revenu * pallier.ratio;
        break;
    }
  }
  productsUnlocks() {
    this.product.palliers.pallier.forEach(palier => {
      if (!palier.unlocked && this.product.quantite >= palier.seuil) {
        palier.unlocked = true;
        this.calcUpgrade(palier);
        this.notifyUnlocked.emit(palier);
      }

    });

  }
}
