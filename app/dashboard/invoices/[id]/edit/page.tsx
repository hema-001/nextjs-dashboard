import From from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById , fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
}

export default async function Page({params}: {params: {id: string}}){
    // const customers = await fetchCustomers();
    const id = params.id;
    const [customers, invoice] = await Promise.all([
        fetchCustomers(),
        fetchInvoiceById(id),
    ]);

    if(!invoice){
        notFound();
    }

    return(
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {label: 'Invoices', href: '/dashboard/invoices'},
                    {label: 'Edit Invoice', href: `/dashboard/invoices/${id}/edit`, active: true,},
                ]}
                />
                <From invoice={invoice} customers={customers} />
        </main>
    )
}