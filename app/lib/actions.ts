'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoiceFromSchema = FormSchema.omit({id: true, date: true});

export async function createInvoice(formData: FormData){
    const {customerId, amount, status} = CreateInvoiceFromSchema.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try{
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
         `;
    }catch(error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
          };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    // Extract form data method 1, for small forms with little inputs
    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // }

    // Extract from data method 2, for larger forms with a lot of inputs
    // const rawFormData = Object.fromEntries(formData.entries())
}

const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(id: string, formData: FormData){
    const {customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try{
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount= ${amountInCents}, status = ${status}
        WHERE id = ${id}
        `;
    }catch(error) {
        return {
            message: 'Database Error: Failed to Update Invoice.',
          };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

export async function deleteInvoice(id: string){
    throw new Error("Failed to delete invoice")
    try{
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        return { message: 'Deleted Invoice.' };
    } catch (error){
        return {
            message: 'Database Error: Failed to Delete Invoice.',
          };;
    }
    revalidatePath('/dashboard/invoices');
}