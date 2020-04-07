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
  constructor(private service: RestService, toasterService: ToasterService) {
    this.qtmulti = this.qt[this.qtIndex];
    this.server = service.getServer();
    this.toasterService = toasterService;

    service.getWorld().then(
      world => {
        this.world = world;
      });
  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.username = localStorage.getItem('username');
    if (this.username == null) {
      this.username = 'Captain' + Math.floor(Math.random() * 10000);
      localStorage.setItem('username', this.username);
    }
    setInterval(() => {
      this.service.saveWorld(this.world);
      this.upgradeDisponibility();
      // this.bonusAllunlock();
    }, 1000);
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
      console.log('same');
    }
    console.log(this.world.money);
    await delay(0);
    this.newManager();
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
  // managerDisponibility(): void {
  //   this.managerDispo = false;
  //   this.world.managers.pallier.forEach(val => {
  //     if (!this.managerDispo) {
  //       if (this.world.money > val.seuil && !val.unlocked) {
  //         this.managerDispo = true;
  //       }
  //     }
  //   });
  // }

  upgradeDisponibility() {
    this.upgradeDispo = false;
    this.world.upgrades.pallier.map(upgrade => {
      if (!this.upgradeDispo) {
        if (!upgrade.unlocked && this.world.money > upgrade.seuil) {
          this.upgradeDispo = true;
        }
      }
    });
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
          this.toasterService.pop('Achat du Manager ' + m.name + ' effectué');
          this.service.putManager(m);
        }
      });
      this.newManager();
      // this.managerDisponibility();
      }

  }
  // buyManager(cost: number, id: number): void {
  //   this.world.money -= cost;
  //   for (const manager of this.world.managers.pallier) {
  //     if (manager.idcible === id) {
  //       manager.unlocked = true;
  //       this.toasterService.pop('success', 'Manager ' + manager.name + 'Embauché !');
  //     }
  //   }
  //   for (const product of this.world.products.product) {
  //     if (product.id === id) {
  //       product.managerUnlocked = true;
  //     }
  //   }
  // }
  productUnlockDone(p: Pallier) {
    this.productsComponent.forEach(prod => {
      if (p.idcible === prod.product.id) {
        this.toasterService.pop('Bonus de ' + p.typeratio + ' effectué sur ' + prod.product.name);
      }
    });
  }
}
