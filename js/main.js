
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.combo-input').forEach(input=>{
   const list=document.getElementById(input.getAttribute('aria-controls'));
   if(!list) return;
   const opts=[...list.querySelectorAll('[role="option"]')];
   let idx=-1;
   function setActive(i){
     idx=i;
     opts.forEach((o,n)=>{
       const active=n===idx;
       o.setAttribute('aria-selected', active?'true':'false');
       if(active){o.setAttribute('aria-current','true');} else {o.removeAttribute('aria-current');}
     });
     input.setAttribute('aria-activedescendant', opts[idx].id);
     input.value=opts[idx].textContent;
   }
   input.addEventListener('focus',()=>{list.hidden=false; input.setAttribute('aria-expanded','true'); if(idx<0 && opts.length) setActive(0);});
   input.addEventListener('keydown',e=>{
     if(e.key==='ArrowDown'){e.preventDefault(); list.hidden=false; input.setAttribute('aria-expanded','true'); setActive(idx<0?0:(idx+1)%opts.length);}
     if(e.key==='ArrowUp'){e.preventDefault(); list.hidden=false; input.setAttribute('aria-expanded','true'); setActive(idx<=0?opts.length-1:idx-1);}
     if(e.key==='Enter'){e.preventDefault(); list.hidden=true; input.setAttribute('aria-expanded','false');}
     if(e.key==='Escape'){e.preventDefault(); list.hidden=true; input.setAttribute('aria-expanded','false');}
   });
 });

 const tablists=document.querySelectorAll('[role="tablist"]');
 tablists.forEach(tablist=>{
   const tabs=[...tablist.querySelectorAll('[role="tab"]')];
   tabs.forEach((tab,index)=>{
     tab.addEventListener('click',()=>activateTab(index));
     tab.addEventListener('keydown',e=>{
       if(e.key==='ArrowRight'){e.preventDefault(); activateTab((index+1)%tabs.length, true);}
       if(e.key==='ArrowLeft'){e.preventDefault(); activateTab((index-1+tabs.length)%tabs.length, true);}
       if(e.key==='Home'){e.preventDefault(); activateTab(0, true);}
       if(e.key==='End'){e.preventDefault(); activateTab(tabs.length-1, true);}
     });
   });
   function activateTab(index, focus=false){
     tabs.forEach((tab,i)=>{
       const selected=i===index;
       tab.setAttribute('aria-selected', selected?'true':'false');
       tab.tabIndex=selected?0:-1;
       const panel=document.getElementById(tab.getAttribute('aria-controls'));
       if(panel){ panel.hidden=!selected; panel.tabIndex=selected?0:-1; }
       if(selected && focus) tab.focus();
     });
   }
 });

 document.querySelectorAll('.accordion-trigger').forEach(btn=>{
   btn.addEventListener('click',()=>{
     const panel=document.getElementById(btn.getAttribute('aria-controls'));
     const expanded=btn.getAttribute('aria-expanded')==='true';
     btn.setAttribute('aria-expanded', expanded?'false':'true');
     if(panel) panel.hidden=expanded;
   });
 });

 const openBtn=document.getElementById('openDialog');
 const dlg=document.getElementById('auditDialog');
 const closeBtn=document.getElementById('closeDialog');
 if(openBtn && dlg && closeBtn){
   const closeDialog=()=>{dlg.hidden=true; openBtn.focus();};
   openBtn.addEventListener('click',()=>{dlg.hidden=false; closeBtn.focus();});
   closeBtn.addEventListener('click',closeDialog);
   dlg.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault(); closeDialog();}});
 }

 const pageLinks=[...document.querySelectorAll('.page-link')];
 if(pageLinks.length){
   const rows=[...document.querySelectorAll('.issue-row')];
   function showPage(page){
     const maxPage=Math.max(...rows.map(r=>Number(r.dataset.page)));
     rows.forEach(row=>row.hidden=row.dataset.page!==String(page));
     pageLinks.forEach(link=>{
       const label=link.textContent.trim();
       if(/^[0-9]+$/.test(label)){
         if(Number(link.dataset.page)===page) link.setAttribute('aria-current','page');
         else link.removeAttribute('aria-current');
       }
       if(label==='Previous'){
         link.setAttribute('aria-disabled', page===1 ? 'true' : 'false');
       }
       if(label==='Next'){
         link.setAttribute('aria-disabled', page===maxPage ? 'true' : 'false');
       }
     });
   }
   showPage(1);
   pageLinks.forEach(link=>link.addEventListener('click',e=>{
     e.preventDefault();
     if(link.getAttribute('aria-disabled')==='true') return;
     const label=link.textContent.trim();
     const current=Number((document.querySelector('.page-link[aria-current="page"]')||{dataset:{page:1}}).dataset.page);
     const maxPage=Math.max(...rows.map(r=>Number(r.dataset.page)));
     let target=current;
     if(label==='Previous') target=Math.max(1,current-1);
     else if(label==='Next') target=Math.min(maxPage,current+1);
     else if(/^[0-9]+$/.test(label)) target=Number(link.dataset.page);
     showPage(target);
   }));
 }
 document.querySelectorAll('form[data-validate]').forEach(form=>{
   const status=form.nextElementSibling && form.nextElementSibling.classList.contains('status') ? form.nextElementSibling : null;
   if(status){
     status.setAttribute('role','status');
     status.setAttribute('aria-live','polite');
     status.tabIndex=-1;
   }
   form.addEventListener('submit',e=>{
     e.preventDefault();
     let valid=true;
     let firstInvalid=null;
     form.querySelectorAll('.error').forEach(err=>{err.hidden=true; err.textContent='';});
     form.querySelectorAll('[aria-invalid="true"]').forEach(f=>f.removeAttribute('aria-invalid'));
     form.querySelectorAll('[data-required="true"]').forEach(field=>{
       let value=String(field.value||'').trim();
       let hasValue=field.type==='checkbox' ? field.checked : value!==''; 
       let invalidFormat=false;
       if(hasValue && field.type==='email'){ invalidFormat=!field.checkValidity(); }
       if(hasValue && field.type==='tel'){ invalidFormat=!/^\d{10}$/.test(value); }
       if(!hasValue || invalidFormat){
         valid=false;
         if(!firstInvalid) firstInvalid=field;
         const err=document.getElementById(field.id+'Err');
         if(err){
           err.textContent = !hasValue ? (field.dataset.empty||'This field is required.') : (field.type==='email' ? 'Enter a valid business email address in the format name@example.com.' : field.type==='tel' ? 'Enter a valid 10-digit phone number using numbers only.' : 'Enter a valid value.');
           err.hidden=false;
         }
         field.setAttribute('aria-invalid','true');
       }
     });
     const groups=[...new Set([...form.querySelectorAll('input[type="radio"][name]')].map(r=>r.name))];
     groups.forEach(name=>{
       const radios=[...form.querySelectorAll('input[type="radio"][name="'+name+'"]')];
       const err=document.getElementById(name+'Err');
       if(radios.length && !radios.some(r=>r.checked)){
         valid=false;
         if(!firstInvalid) firstInvalid=radios[0];
         if(err){err.textContent='Select an option.'; err.hidden=false;}
       }
     });
     const agree=form.querySelector('#agree');
     if(agree && !agree.checked){
       valid=false;
       if(!firstInvalid) firstInvalid=agree;
       const err=document.getElementById('agreeErr');
       if(err){err.textContent='You must provide consent.'; err.hidden=false;}
     }
     if(status){
       status.hidden=false;
     }
     if(valid){
       if(status) status.textContent='Form submitted successfully.';
       const section=form.closest('section'); if(section){ const inst=section.querySelector('.instruction'); if(inst) inst.hidden=true; } form.hidden=true;
       if(status) status.focus();
     } else {
       if(status) status.textContent='Please correct the errors in the form.';
       if(firstInvalid) firstInvalid.focus();
     }
   });
 });


});