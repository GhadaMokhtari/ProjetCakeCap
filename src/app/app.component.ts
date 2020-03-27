import { Component } from '@angular/core';
import { RestService } from './rest.service';
import { World, Product, Pallier } from './world';
import {ModalComponent} from './modal/modal.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CakeCap';
  world: World = new World();
  server: string;
  qtmulti: string;
  qtIndex = 0;
  qt: string[] = ['1', '10', '100', 'Max'];

  managerDispo: boolean;
  upgradeDispo: boolean;
  constructor(private service: RestService) {
    this.server = service.server;
    service.getWorld().then(
      world => {
        this.world = world;
      });
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
  onProductBuy(cost: number): void {
    if (this.world.money >= cost) {
      this.world.money -= cost;
    }
    this.newManager();
  }

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
  managerDisponibility(): void {
    this.managerDispo = false;
    this.world.managers.pallier.forEach(val => {
      if (!this.managerDispo) {
        if (this.world.money > val.seuil && !val.unlocked) {
          this.managerDispo = true;
        }
      }
    });
  }

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
  // achatManager(m: Pallier) {
  //   if (this.world.money >= m.seuil) {
  //     this.world.money = this.world.money - m.seuil;
  //     let index = this.world.managers.pallier.indexOf(m);
  //     this.world.managers.pallier[index].unlocked = true;
  //
  //     this.world.products.product.forEach(element => {
  //       if (m.idcible == element.id) {
  //         let index = this.world.products.product.indexOf(element);
  //         this.world.products.product[index].managerUnlocked = true;
  //       }
  //     });
  //     this.managerDisponibility();
  //     this.toastr.success('Achat du Manager ' + m.name + ' effectué');
  //     }
  //
  // }
  buyManager(cost: number, id: number): void {
    this.world.money -= cost;
    for (const manager of this.world.managers.pallier) {
      if (manager.idcible === id) {
        manager.unlocked = true;
        // this.toasterService.pop('success', 'Manager Embauché !', manager.name);
      }
    }
    for (const product of this.world.products.product) {
      if (product.id === id) {
        product.managerUnlocked = true;
      }
    }
  }
  showManagers(m: ModalComponent) {
    m.show();
  }
}
