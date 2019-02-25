from django.template import Library

register = Library()


def mult(value1, value2):
    if value2 is None:
        return value1
    else:
        return value1 * value2


register.filter('mult', mult)



