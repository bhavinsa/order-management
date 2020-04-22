import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../services/order.service';
import { User } from '../models/user';
import { Socket } from 'ngx-socket-io';
@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrls: ['./product.component.less']
})
export class ProductDetailsComponent implements OnInit {
    public product = {};
    public error;
    public showToast = false;
    currentUser: User;
    isBuy = true;

    // tslint:disable-next-line:max-line-length
    constructor(private productService: ProductService, private route: ActivatedRoute, private modalService: NgbModal, private orderService: OrderService, private authenticationService: AuthenticationService, private socket: Socket) { }

    ngOnInit() {
      this.socket.on('message', (data) => {
        console.log('message client' + JSON.stringify(data));
        // tslint:disable-next-line:no-string-literal
        if (this.product['id'] === data.productId) {
          // tslint:disable-next-line: no-string-literal
          this.product['quantity'] = data.quantity;
          if (data.quantity === 0) {
          this.isBuy = false;
        } else {
          this.isBuy = true;
        }
      }
      });
      this.authenticationService.currentUser.subscribe(x => {
            this.currentUser = x;
            if (this.currentUser) {
              this.fetchProduct();
            }
        });
    }

    fetchProduct() {
        this.route.params.subscribe((params) => {
            this.productService.getProductById(params.id).subscribe((product) => {
              this.product = product;
              if (this.product && this.product['quantity'] === 0) {
                this.isBuy = false;
              } else {
                this.isBuy = true;
              }
            });
        });
    }

    open(content) {
        this.modalService.open(content);

        return false;
    }

    close() {
        this.modalService.dismissAll();
        this.error = '';
    }

    proceedToBuy(data) {
        if (data && data.pin === '') {
            this.error = 'Pin is required to proceed.';
            return;
        }

        if (this.error) {
            this.error = '';
        }

        this.orderService.placeNewOrder({
            productId: (this.product) ? this.product['id'] : '',
            userId: this.currentUser.id,
            // tslint:disable-next-line:use-isnan
            authPin: parseInt(data.pin, 10) === NaN ? data.pin : parseInt(data.pin, 10)
        }).subscribe(data => {
            this.close();
            this.fetchProduct();
            this.showToast = true;
        }, failure => {
            console.log('Error', failure);
            if (failure.status === 400) {
                this.error = failure.error.error.message;
            } else {
                this.error = 'Something went wrong while processing your request!';
            }
        });
    }
}
