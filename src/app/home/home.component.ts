import { Component, OnInit } from '@angular/core';
import { cart, product } from '../data-type';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
 popularProducts:undefined|product[];
 trendyProducts:undefined | product[];
 removeCart: boolean;
  constructor(private product:ProductService) {}

  ngOnInit(): void {
    this.product.popularProducts().subscribe((data)=>{
      this.popularProducts=data;
    })

    this.product.trendyProducts().subscribe((data)=>{
      this.trendyProducts = this.updateTrendyProd(data);
    })
  }

  updateTrendyProd(trendyProducts): product[]{
    this.product.currentCart().subscribe(data=>{
      if(data){
        trendyProducts.forEach((prod: product) => {
          const index = data.findIndex(item => item.id == prod.id);
          prod.isInCart = index!=-1;
        })
      }
    })
    return trendyProducts;
  }

  addToCart(prodId: number){
    
    if(prodId){
      const productData:product = this.trendyProducts.find(item => item.id == prodId);
      productData.quantity = 1;
      if(!localStorage.getItem('user')){
        this.product.localAddToCart(productData);
        this.trendyProducts = this.updateTrendyProd(this.trendyProducts);
        this.removeCart=true
      }else{
        let user = localStorage.getItem('user');
        let userId= user && JSON.parse(user).id;
        let cartData:cart={
          ...productData,
          productId:productData.id,
          userId
        }
        delete cartData.id;
        this.product.addToCart(cartData).subscribe((result)=>{
          if(result){
           this.product.getCartList(userId);
           this.removeCart=true
           this.trendyProducts = this.updateTrendyProd(this.trendyProducts);
          }
        })        
      }
      
    } 
  }

  removeFromCart(productId: number){
    if(productId){
      if(!localStorage.getItem('user')){
        this.product.removeItemFromCart(productId);
        this.trendyProducts = this.updateTrendyProd(this.trendyProducts);
      }else{
        this.product.removeToCart(productId)
        .subscribe((result)=>{
          let user = localStorage.getItem('user');
          let userId= user && JSON.parse(user).id;
          this.product.getCartList(userId);
          this.trendyProducts = this.updateTrendyProd(this.trendyProducts);
        })
      }
      this.removeCart=false
    }
  }
}