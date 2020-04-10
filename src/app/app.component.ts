import { Component, ViewChildren, QueryList } from '@angular/core';
import { RestService } from './rest.service';
import { World, Product, Pallier } from './world';
import {ModalComponent} from './modal/modal.component';
import { ProductComponent } from './product/product.component';
import {ToasterService} from 'angular2-toaster';
import {apiUrl} from './api';
import {delay} from 'rxjs/operators';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChildren(ProductComponent) public productsComponent: QueryList<ProductComponent>;
  title = 'CakeCap';
  world: World = new World();
  server: string;
  qtmulti: string;
  qtIndex = 0;
  qt: string[] = ['1', '10', '100', 'Max'];
  toasterService: ToasterService;
  username: string;


  managerDispo: boolean;
  upgradeDispo: boolean;
  dispoAngel: boolean;
  private toasteService: any;
  constructor(private service: RestService, toasterService: ToasterService) {
    this.qtmulti = this.qt[this.qtIndex];
    this.server = service.getServer();
    service.setUser(localStorage.getItem('username'));
    this.toasterService = toasterService;

    service.getWorld().then(
      world => {
        this.world = world;
      });
    setTimeout(() => { console.log(this.world.money); console.log(this.world.score);
      // tslint:disable-next-line:triple-equals
                       if (this.world.activeangels != 0) {
        console.log('coucou');
        console.log(this.world.products);
        this.world.products.product.forEach(produit => {
          console.log('coucou');
          produit.revenu = produit.revenu * (1 + (this.world.activeangels * this.world.angelbonus / 100));
        });
      }
    }, 100);
  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.username = localStorage.getItem('username');
    if (this.username == null) {
      this.username = 'Captain' + Math.floor(Math.random() * 10000);
      localStorage.setItem('username', this.username);
    }
    setInterval(() => {
      //  this.service.saveWorld(this.world);
      this.newManager();
      this.angelsDisponibility();
      this.upgradeDisponibility();
      this.bonusAllunlock();
    }, 100);
  }
  getImage() {
    return apiUrl + this.world.logo;
  }
  onUsernameChanged() {
    localStorage.setItem('username', this.username);
    this.service.setUser(this.username);
  }

  buyMulti() {
    this.qtIndex = (this.qtIndex + 1) % this.qt.length;
    this.qtmulti = this.qt[this.qtIndex];
  }

  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.revenu * p.quantite;
    this.world.score = this.world.score + p.revenu * p.quantite;
    this.newManager();
  }
  // onBuyDone
  async onProductBuy(cost: number) {
    if (this.world.money >= cost) {
      this.world.money -= cost;
      console.log('hi' + cost);
    } else {
      this.world.money = this.world.money;
    }
    console.log(this.world.money);
    await delay(0);
    this.newManager();
    this.upgradeDisponibility();
  }

  // vérifie la disponibbilité des managers et ajoute la mention new sur le bouton
  newManager() {
    for (const manager of this.world.managers.pallier) {
      if (this.world.money >= manager.seuil && manager.unlocked === false) {
        document.getElementById('btnManagers').innerHTML = '<span class="badge">New</span> Managers';
        break;
      } else {
        document.getElementById('btnManagers').innerHTML = 'Managers';
      }
    }
  }

  bonusAllunlock() {
    // on recherche la quantité minmal des produits
    const min = Math.min(
      ...this.productsComponent.map(p => p.product.quantite)
    );
    this.world.allunlocks.pallier.map(pallier => {
      // si la quantité minimal dépasse le seuil, on débloque le produit concerné
      if (!pallier.unlocked && min >= pallier.seuil) {
        pallier.unlocked = true;
        this.productsComponent.forEach(prod => prod.calcUpgrade(pallier));
        this.toasterService.pop('popup', 'Bonus global', 'Bonus of ' + pallier.typeratio + ' performed on all products');
      }
    });
  }

  upgradeDisponibility() {
    this.upgradeDispo = false;
    this.world.upgrades.pallier.map(upgrade => {
      if (!this.upgradeDispo) {
        if (!upgrade.unlocked && this.world.money > upgrade.seuil) {
          this.upgradeDispo = true;
          document.getElementById('btnUpgrades').innerHTML = '<span class="badge">New</span> Cash Upgrade';
        } else {
          document.getElementById('btnUpgrades').innerHTML = 'Cash Upgrade';
        }
      }
    });
  }

  buyUpgrade(u: Pallier) {
    if (this.world.money >= u.seuil) {
      this.world.money = this.world.money - u.seuil;
      this.world.upgrades.pallier[this.world.upgrades.pallier.indexOf(u)].unlocked = true;

      if (u.idcible === 0) {
        this.productsComponent.forEach(prod => prod.calcUpgrade(u));
        this.toasterService.pop('popup', 'Global Upgrade', 'Upgrade buy ' + u.typeratio + ' for all products');
      } else {
        this.productsComponent.forEach(prod => {
          if (u.idcible === prod.product.id) {
            prod.calcUpgrade(u);
            this.toasterService.pop('popup', 'Upgrade', 'Upgrade buy ' + u.typeratio + ' for ' + prod.product.name);
          }
        });
      }
      this.upgradeDisponibility();
      this.service.putUpgrade(u);
    }
  }

  buyManager(m: Pallier) {
    if (this.world.money >= m.seuil) {
      this.world.money = this.world.money - m.seuil;
      const index = this.world.managers.pallier.indexOf(m);
      this.world.managers.pallier[index].unlocked = true;

      this.world.products.product.forEach(element => {
        if (m.idcible === element.id) {
          const indexe = this.world.products.product.indexOf(element);
          this.world.products.product[indexe].managerUnlocked = true;
          this.toasterService.pop('popup', 'Congrats !', 'Manager\'s purchase ' + m.name + ' made');
        }
      });
      this.newManager();
      this.service.putManager(m);
      }
  }

  angelsDisponibility() {
    for (const angel of this.world.angelupgrades.pallier) {
      if (this.world.money >= angel.seuil && angel.unlocked === false) {
        document.getElementById('btnAngels').innerHTML = '<span class="badge">New</span> Angels Upgrade';
        break;
      } else {
        document.getElementById('btnAngels').innerHTML = 'Angels Upgrade';
      }
    }
  }

  productUnlockDone(p: Pallier) {
    this.productsComponent.forEach(prod => {
      if (p.idcible === prod.product.id) {
        this.toasterService.pop('popup', 'Congrats !', 'Bonus of ' + p.typeratio + ' performed on' + prod.product.name);
      }
    });
  }

  buyAngels(angel) {
    if (this.world.activeangels >= angel.seuil) {
      this.world.activeangels -= angel.seuil;
      angel.unlocked = true;
      if (angel.typeratio === 'ange') {
        this.world.angelbonus += angel.ratio;
      } else {
        if (angel.idcible === 0) {
          this.productsComponent.forEach(product => product.calcUpgrade(angel));
          this.toasterService.pop('popup', 'Upgrade buy' + angel.typeratio + 'for all products', 'Upgrade Angels');
        } else {
          this.productsComponent[angel.idcible - 1].calcUpgrade(angel);
          // tslint:disable-next-line:max-line-length
          this.toasterService.pop('Upgrade buy ' + angel.typeratio + ' for ' + this.world.products.product[angel.idcible - 1].name, 'Upgrade Angels');
        }
      }
      this.service.putAngel(angel);
    }
  }

  claimAndRestart(): void {
    this.service.deleteWorld();
    window.location.reload();
  }
}
