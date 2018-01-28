import sys
def application(environ, start_response):
    ret = str(sys.path)
    start_response("200 OK" , [('Content-type','text/html')] )
    return ret