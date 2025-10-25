from django.db import models

class InvoiceTemplate(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="invoice_templates/")

    def __str__(self):
        return self.title
