export function constantTimeEqual(a:string,b:string){const x=new TextEncoder().encode(a),y=new TextEncoder().encode(b);let diff=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)diff|=(x[i]||0)^(y[i]||0);return diff===0;}
export function parseCaktoEvent(body:any){
 if(!['purchase_approved','refund','chargeback'].includes(body?.event))return {ignored:true,event:'',data:null};
 const d=body.data;
 if(!d||typeof d.id!=='string'||!d.id||typeof d.offer?.id!=='string'||typeof d.product?.id!=='string'||typeof d.customer?.email!=='string'||!/^\S+@\S+\.\S+$/.test(d.customer.email))throw Error('Invalid event');
 if(body.event==='purchase_approved'&&d.status!=='paid')throw Error('Payment is not approved');
 // Retain only fields necessary for entitlement. No CPF, phone, card or secret is stored.
 return {ignored:false,event:body.event,data:{id:d.id,offer:{id:d.offer.id},product:{id:d.product.id},customer:{email:d.customer.email.trim().toLowerCase()},status:d.status}};
}

// Cakto probes use a fixed fictitious product/offer pair, but may vary order/email.
// Acknowledge only this pair, after authentication; never persist or grant access.
export function isCaktoExample(data:any){return data?.product?.id==='ff3fdf61-e88f-43b5-982a-32d50f112414'&&data?.offer?.id==='B8BcHrY';}
